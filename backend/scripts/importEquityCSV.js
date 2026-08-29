const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Stock = require('../models/Stock');
const Sector = require('../models/Sector');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * Intelligent CSV Parser that handles quoted values and commas.
 */
function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) return [];

  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }
  return rows;
}

/**
 * Helper to categorize sector from company name and symbol keywords.
 */
function detectSector(name = '', symbol = '') {
  const upper = (name + ' ' + symbol).toUpperCase();

  if (/\b(BANK|FINANCE|FINANCIAL|CAPITAL|FINSERV|HOUSING|MUTUAL|INVEST|LEASING|HOLDING|INSURANCE|WEALTH|AMC|CREDIT|FIN)\b/.test(upper)) {
    return 'Banking & Finance';
  }
  if (/\b(TECH|SOFTWARE|INFOTECH|COMPUTERS|DIGITAL|CYBER|IT|SYSTEM|SOLUTIONS|TELECOM|MEDIA|NETWORKS)\b/.test(upper)) {
    return 'Information Technology';
  }
  if (/\b(PHARMA|DRUGS|LAB|HEALTHCARE|MEDICAL|HOSPITAL|CLINIC|LIFE|DIAGNOSTIC|BIO)\b/.test(upper)) {
    return 'Pharmaceuticals & Healthcare';
  }
  if (/\b(MOTORS|AUTO|AUTOMOTIVE|TYRES|VEHICLE|CAR|AXLE|TYRE|SEATS)\b/.test(upper)) {
    return 'Automobile';
  }
  if (/\b(POWER|ENERGY|GAS|PETRO|OIL|COAL|HYDRO|SOLAR|WIND|ELECTRIC|RENEWABLE|UTILITIES)\b/.test(upper)) {
    return 'Energy & Power';
  }
  if (/\b(FOOD|BEVERAGE|BREWERIES|CONSUMER|RETAIL|FASHION|AGRO|OILS|SUGAR|FLOUR|DAIRY|TOBACCO|SNACKS|JEWELLERS)\b/.test(upper)) {
    return 'FMCG & Retail';
  }
  if (/\b(INFRA|BUILD|CONSTRUCT|REALTY|ESTATE|DEVELOPERS|PROJECTS|CEMENT|PIPES|ENGINEERING|INFRASTRUCTURE)\b/.test(upper)) {
    return 'Infrastructure & Real Estate';
  }
  if (/\b(STEEL|METALS|MINING|IRON|ALUMINIUM|COPPER|ALLOY|FORGING|ISPAT|MINES|MINERAL)\b/.test(upper)) {
    return 'Metals & Mining';
  }
  if (/\b(CHEM|FERTILIZER|ORGANIC|PESTICIDE|POLYMER|PLASTICS|COATING|PAINT|PIGMENT|ALKALI)\b/.test(upper)) {
    return 'Chemicals';
  }
  if (/\b(TEXTILE|SPINNING|SYNTHETIC|SILK|COTTON|GARMENT|FABRIC|YARN|WEAVING|MILLS|FASHIONS)\b/.test(upper)) {
    return 'Textiles';
  }
  if (/\b(BEARING|VALVE|MACHINE|TOOL|INDUSTRIAL|WIRE|CABLE|ELECTRICAL|HARDWARE|EQUIPMENT)\b/.test(upper)) {
    return 'Capital Goods & Industrial';
  }
  if (/\b(HOTEL|HOSPITALITY|RESORT|ENTERTAINMENT|FILMS|HOTELS|HOLIDAYS|CINEMA)\b/.test(upper)) {
    return 'Hospitality & Leisure';
  }
  if (/\b(LOGISTICS|CARGO|SHIPPING|PORT|FREIGHT|TRANSPORT|EXPRESS|DELIVERY)\b/.test(upper)) {
    return 'Logistics & Services';
  }
  if (/\b(PAPER|PACKAGING|BOARD|CONTAINER|PRINT|PACK)\b/.test(upper)) {
    return 'Paper & Packaging';
  }

  return 'Diversified & Others';
}

/**
 * Generate a consistent pseudo-random price and intraday history for a given symbol.
 */
function generateSyntheticStockData(symbol, name, sector) {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = (hash << 5) - hash + symbol.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);

  const basePrice = Number(((posHash % 2450) + 25.5).toFixed(2));
  const changePercent = Number((((posHash % 900) / 100) - 4.5).toFixed(2)); // -4.5% to +4.5%
  const dayChange = Number(((basePrice * changePercent) / 100).toFixed(2));
  const currentPrice = Number((basePrice + dayChange).toFixed(2));

  const weekHigh52 = Number((currentPrice * (1 + (posHash % 35) / 100 + 0.1)).toFixed(2));
  const weekLow52 = Number((currentPrice * (1 - (posHash % 30) / 100 - 0.1)).toFixed(2));

  const rawCap = Math.floor((posHash % 150000) + 250);
  const marketCap = rawCap;
  let marketCapLabel = 'Small Cap';
  if (marketCap > 20000) marketCapLabel = 'Large Cap';
  else if (marketCap > 5000) marketCapLabel = 'Mid Cap';

  const peRatio = Number(((posHash % 60) + 8.5).toFixed(1));
  const pbRatio = Number(((posHash % 15) + 1.1).toFixed(1));
  const dividendYield = Number(((posHash % 350) / 100).toFixed(2));

  const dayHigh = Number((Math.max(basePrice, currentPrice) + (posHash % 15)).toFixed(2));
  const dayLow = Number((Math.min(basePrice, currentPrice) - (posHash % 12)).toFixed(2));
  const volume = (posHash % 850000) + 15000;

  // Generate intraday price points
  const points = [];
  const numPoints = 26;
  const startTime = new Date();
  startTime.setHours(9, 15, 0, 0);

  for (let i = 0; i < numPoints; i++) {
    const timeMs = startTime.getTime() + i * 15 * 60 * 1000;
    const dateObj = new Date(timeMs);
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    const factor = (i / (numPoints - 1));
    const trend = basePrice + (currentPrice - basePrice) * factor;
    const noise = (Math.sin(i * 1.5 + (posHash % 10)) * 0.008 + (Math.cos(i * 3) * 0.004)) * currentPrice;
    const price = i === numPoints - 1 ? currentPrice : Math.max(basePrice * 0.8, trend + noise);

    const open = price - (Math.random() * 2 - 1) * (currentPrice * 0.002);
    const high = Math.max(open, price) + Math.random() * (currentPrice * 0.003);
    const low = Math.min(open, price) - Math.random() * (currentPrice * 0.003);
    const close = price;

    points.push({
      date: timeStr,
      price: Number(price.toFixed(2)),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor(volume / numPoints)
    });
  }

  return {
    currentPrice,
    dayChange,
    dayChangePercent: changePercent,
    weekHigh52,
    weekLow52,
    marketCap,
    marketCapLabel,
    peRatio,
    pbRatio,
    dividendYield,
    dayHigh,
    dayLow,
    volume,
    priceHistory: points
  };
}

async function importEquityCSV() {
  try {
    const csvPath = path.join(__dirname, '../../EQUITY_L.csv');
    console.log(`📄 Reading CSV file from: ${csvPath}`);
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at ${csvPath}`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const rows = parseCSV(csvContent);
    console.log(`📊 Parsed ${rows.length} equities from CSV.`);

    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stockvista';
    console.log(`📡 Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Fetch existing symbols in one fast query
    const existingStocks = await Stock.find({}, { symbol: 1, sector: 1 });
    const existingMap = new Map();
    existingStocks.forEach(s => existingMap.set(s.symbol, s));

    let insertedCount = 0;
    let updatedCount = 0;
    const sectorCounts = {};

    const bulkOps = [];

    for (const row of rows) {
      const symbol = (row['SYMBOL'] || '').trim().toUpperCase();
      const name = (row['NAME OF COMPANY'] || '').trim();
      const series = (row['SERIES'] || '').trim();
      const dateOfListing = (row['DATE OF LISTING'] || '').trim();
      const paidUpValue = Number(row['PAID UP VALUE']) || 10;
      const marketLot = Number(row['MARKET LOT']) || 1;
      const isinNumber = (row['ISIN NUMBER'] || '').trim();
      const faceValue = Number(row['FACE VALUE']) || 10;

      if (!symbol || !name) continue;

      const sector = detectSector(name, symbol);
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;

      if (existingMap.has(symbol)) {
        // Prepare update operation
        const updateObj = {
          name,
          series,
          dateOfListing,
          paidUpValue,
          marketLot,
          isinNumber,
          faceValue
        };
        const st = existingMap.get(symbol);
        if (!st.sector || st.sector === 'General') {
          updateObj.sector = sector;
        }
        bulkOps.push({
          updateOne: {
            filter: { symbol },
            update: { $set: updateObj }
          }
        });
        updatedCount++;
      } else {
        // Prepare insert operation
        const synthData = generateSyntheticStockData(symbol, name, sector);
        bulkOps.push({
          insertOne: {
            document: {
              symbol,
              name,
              sector,
              exchange: 'NSE',
              series,
              dateOfListing,
              paidUpValue,
              marketLot,
              isinNumber,
              faceValue,
              ...synthData,
              isActive: true
            }
          }
        });
        insertedCount++;
      }
    }

    if (bulkOps.length > 0) {
      console.log(`⏳ Executing bulkWrite for ${bulkOps.length} operations...`);
      await Stock.bulkWrite(bulkOps, { ordered: false });
    }

    console.log(`\n🎉 CSV Import Summary:`);
    console.log(`   - New Stocks Inserted: ${insertedCount}`);
    console.log(`   - Existing Stocks Updated: ${updatedCount}`);
    console.log(`   - Total Stocks in DB: ${await Stock.countDocuments()}`);

    // Sync Sectors
    console.log(`\n📊 Updating Sectors in MongoDB...`);
    for (const [secName, count] of Object.entries(sectorCounts)) {
      await Sector.findOneAndUpdate(
        { name: secName },
        {
          name: secName,
          slug: secName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: `Market equities categorized under ${secName}.`,
          stockCount: count
        },
        { upsert: true, new: true }
      );
    }
    console.log('✅ Sector categories synchronized.');

    console.log('\n🚀 EQUITY_L.csv data successfully imported into MongoDB database!');
  } catch (err) {
    console.error('❌ Error importing EQUITY_L.csv:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  }
}

importEquityCSV();
