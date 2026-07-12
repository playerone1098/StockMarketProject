const IPO = require('../models/IPO');

/**
 * Simulates a realistic random walk increment.
 * @param {number} min - Minimum increment
 * @param {number} max - Maximum increment
 * @returns {number} Random float between min and max
 */
const getRandomIncrement = (min, max) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

/**
 * Fetches real IPO data from stock.indianapi.in if API key is present.
 * @param {string} apiKey - The IndianAPI secret token
 * @returns {Promise<Array|null>} Array of IPO objects or null on failure
 */
const fetchLiveIpoData = async (apiKey) => {
  try {
    console.log('📡 Fetching live IPO details from stock.indianapi.in...');
    const response = await fetch('https://stock.indianapi.in/ipo', {
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.data && Array.isArray(data.data) ? data.data : null);
  } catch (err) {
    console.error('⚠️ IndianAPI IPO fetch failed:', err.message);
    return null;
  }
};

/**
 * Synchronizes Indian IPO states and live subscription numbers.
 * Integrates real-time external API (IndianAPI) if key is present,
 * and falls back to a realistic simulation mode otherwise.
 * @returns {Promise<{success: boolean, updated: number, mode: string, errors: Array}>}
 */
const syncIpoData = async (force = false) => {
  const apiKey = process.env.INDIAN_API_KEY;
  const isSimulationMode = !apiKey;
  const modeLabel = isSimulationMode ? 'Simulation Mode' : 'Live API Mode';
  
  // Throttle API requests in Live API mode to strictly respect 500 requests/month pacing (every 86.4 minutes)
  if (!isSimulationMode && !force) {
    const lastUpdatedIpo = await IPO.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (lastUpdatedIpo) {
      const timeSinceLastSync = Date.now() - new Date(lastUpdatedIpo.updatedAt).getTime();
      const minInterval = 86.4 * 60 * 1000; // 86.4 minutes in ms
      if (timeSinceLastSync < minInterval) {
        const remainingMs = minInterval - timeSinceLastSync;
        console.log(`⏳ IPO API sync throttled. Last sync was ${Math.round(timeSinceLastSync / 60000)}m ago. Next sync in ${Math.round(remainingMs / 60000)}m.`);
        return { success: true, updated: 0, mode: modeLabel, skipped: true };
      }
    }
  }

  console.log(`🔄 Initiating IPO live data synchronization (${modeLabel})...`);

  try {
    const activeIpos = await IPO.find({ isActive: true });

    if (activeIpos.length === 0) {
      console.log('⚠️ No active IPOs found to synchronize.');
      return { success: true, updated: 0, mode: modeLabel, errors: [] };
    }

    let updatedCount = 0;
    const errors = [];
    const now = new Date();

    // Fetch API data if key is available
    let liveIpoList = null;
    if (!isSimulationMode) {
      liveIpoList = await fetchLiveIpoData(apiKey);
      if (!liveIpoList) {
        console.log('⚠️ Falling back to Simulation Mode due to API error.');
      }
    }

    for (const ipo of activeIpos) {
      try {
        const updates = {};
        let statusChanged = false;
        let subscriptionUpdated = false;

        // Try to find matching IPO from live API list
        let matchedLiveIpo = null;
        if (liveIpoList) {
          const dbSymbol = (ipo.symbol || '').toUpperCase();
          const dbName = (ipo.companyName || '').toLowerCase();

          matchedLiveIpo = liveIpoList.find(apiIpo => {
            const apiSymbol = (apiIpo.symbol || '').toUpperCase();
            const apiName = (apiIpo.name || apiIpo.companyName || '').toLowerCase();
            
            return (dbSymbol && apiSymbol === dbSymbol) || 
                   (dbName && apiName.includes(dbName)) || 
                   (apiName && dbName.includes(apiName));
          });
        }

        if (matchedLiveIpo) {
          // --- LIVE API UPDATE PATH ---
          console.log(`🎯 Matched live data for IPO: ${ipo.companyName}`);

          // 1. Map Status
          let newStatus = ipo.status;
          const apiStatus = (matchedLiveIpo.status || '').toLowerCase();
          if (['upcoming', 'open', 'closed', 'listed'].includes(apiStatus)) {
            newStatus = apiStatus;
          } else {
            // Fallback status check based on date if API status is missing/unrecognized
            const openTime = new Date(ipo.openDate).getTime();
            const closeTime = new Date(ipo.closeDate).getTime();
            const listingTime = ipo.listingDate ? new Date(ipo.listingDate).getTime() : null;

            if (now.getTime() < openTime) newStatus = 'upcoming';
            else if (now.getTime() >= openTime && now.getTime() <= closeTime) newStatus = 'open';
            else if (now.getTime() > closeTime && (!listingTime || now.getTime() < listingTime)) newStatus = 'closed';
            else if (listingTime && now.getTime() >= listingTime) newStatus = 'listed';
          }

          if (newStatus !== ipo.status) {
            updates.status = newStatus;
            statusChanged = true;
          }

          // 2. Map Subscription Status
          // Search various possible payload formats for subscription fields
          const apiSub = matchedLiveIpo.subscription || matchedLiveIpo.subscriptionStatus || {};
          const retail = apiSub.retail ?? matchedLiveIpo.retail ?? ipo.subscriptionStatus.retail;
          const nii = apiSub.nii ?? matchedLiveIpo.nii ?? ipo.subscriptionStatus.nii;
          const qib = apiSub.qib ?? matchedLiveIpo.qib ?? ipo.subscriptionStatus.qib;
          const total = apiSub.total ?? matchedLiveIpo.total ?? parseFloat(((retail + nii + qib) / 3).toFixed(2));

          updates.subscriptionStatus = { retail, nii, qib, total };
          subscriptionUpdated = true;

          // 3. Map Listing Price
          const listingPrice = matchedLiveIpo.listingPrice || matchedLiveIpo.listedPrice;
          if (newStatus === 'listed' && listingPrice) {
            updates.listingPrice = listingPrice;
          }

        } else {
          // --- SIMULATED FALLBACK PATH ---
          // 1. Determine status based on dates
          let currentStatus = ipo.status;
          let newStatus = currentStatus;

          const openTime = new Date(ipo.openDate).getTime();
          const closeTime = new Date(ipo.closeDate).getTime();
          const listingTime = ipo.listingDate ? new Date(ipo.listingDate).getTime() : null;

          if (now.getTime() < openTime) {
            newStatus = 'upcoming';
          } else if (now.getTime() >= openTime && now.getTime() <= closeTime) {
            newStatus = 'open';
          } else if (now.getTime() > closeTime && (!listingTime || now.getTime() < listingTime)) {
            newStatus = 'closed';
          } else if (listingTime && now.getTime() >= listingTime) {
            newStatus = 'listed';
          }

          if (newStatus !== currentStatus) {
            updates.status = newStatus;
            statusChanged = true;
            console.log(`ℹ️ IPO ${ipo.companyName} status changed (Simulated): ${currentStatus} -> ${newStatus}`);
          }

          // 2. Update subscription status for open IPOs
          if (newStatus === 'open') {
            const retailInc = getRandomIncrement(0.05, 0.25);
            const niiInc = getRandomIncrement(0.1, 0.45);
            const qibInc = getRandomIncrement(0.15, 0.85);

            const retail = parseFloat(((ipo.subscriptionStatus?.retail || 0) + retailInc).toFixed(2));
            const nii = parseFloat(((ipo.subscriptionStatus?.nii || 0) + niiInc).toFixed(2));
            const qib = parseFloat(((ipo.subscriptionStatus?.qib || 0) + qibInc).toFixed(2));
            const total = parseFloat(((retail + nii + qib) / 3).toFixed(2));

            updates.subscriptionStatus = { retail, nii, qib, total };
            subscriptionUpdated = true;
          }

          // 3. Update listing price for listed IPOs
          if (newStatus === 'listed' && (!ipo.listingPrice || ipo.listingPrice === 0)) {
            const maxPrice = ipo.priceRange?.max || 100;
            const changePercent = getRandomIncrement(-0.15, 0.75);
            const listingPrice = Math.round(maxPrice * (1 + changePercent));
            
            updates.listingPrice = listingPrice;
            console.log(`🎉 IPO ${ipo.companyName} listed! Price set (Simulated) to ₹${listingPrice}`);
          }
        }

        // Apply changes to database if any updates occurred
        if (statusChanged || subscriptionUpdated || updates.listingPrice) {
          await IPO.updateOne({ _id: ipo._id }, { $set: updates });
          updatedCount++;
        }

      } catch (ipoError) {
        errors.push({ id: ipo._id, name: ipo.companyName, error: ipoError.message });
        console.error(`❌ Failed to sync IPO ${ipo.companyName}:`, ipoError.message);
      }
    }

    console.log(`📊 IPO synchronization complete. Updated: ${updatedCount}`);
    return {
      success: true,
      updated: updatedCount,
      mode: modeLabel,
      errors
    };

  } catch (globalError) {
    console.error('❌ Critical error during IPO data sync:', globalError);
    return {
      success: false,
      error: globalError.message || 'Global IPO sync failure'
    };
  }
};

module.exports = {
  syncIpoData
};
