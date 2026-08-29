const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const config = require('../config');
const SocialPost = require('../models/SocialPost');
const SocialComment = require('../models/SocialComment');

const samplePosts = [
  {
    authorName: 'Rakesh_Trader',
    authorRole: 'Senior Equity Analyst',
    content: '🚀 RELIANCE showing strong breakout above 3000 resistance level on high daily volumes! Retail participation is peaking and green hydrogen investments are starting to yield dividends. Bullish setup for 3250 target.',
    taggedStock: 'RELIANCE',
    sentiment: 'BULLISH',
    targetPrice: 3250,
    timeframe: 'Swing',
    isPinned: true,
    likes: ['user1', 'user2', 'user3', 'user4', 'user5'],
    likeCount: 42,
    commentsCount: 3,
    status: 'active'
  },
  {
    authorName: 'MarketGuru_IN',
    authorRole: 'Pro Trader',
    content: '📉 TATAMOTORS EV sales growth slowed down slightly in Q2 due to supply chain bottlenecks. Expecting a short term pullback towards 920 support level before next momentum run. Trade cautious.',
    taggedStock: 'TATAMOTORS',
    sentiment: 'BEARISH',
    targetPrice: 920,
    timeframe: 'Short Term',
    isPinned: false,
    likes: ['user1', 'user6'],
    likeCount: 18,
    commentsCount: 2,
    status: 'active'
  },
  {
    authorName: 'DalalStreetPro',
    authorRole: 'Chartered Market Technician',
    content: '🏛️ HDFCBANK merger synergies are finally visible in credit growth metrics! FII buying has resumed consistently over the last 5 sessions. Golden cross forming on 50/200 DMA.',
    taggedStock: 'HDFCBANK',
    sentiment: 'BULLISH',
    targetPrice: 1850,
    timeframe: 'Long Term',
    isPinned: false,
    likes: ['user2', 'user3', 'user7', 'user8'],
    likeCount: 35,
    commentsCount: 1,
    status: 'active'
  },
  {
    authorName: 'TechBull_Vikram',
    authorRole: 'Swing Specialist',
    content: '💻 INFY guidance update expected next week. IT sector is recovering strongly post US rate cut signals. Accumulating on dips around 1780 level.',
    taggedStock: 'INFY',
    sentiment: 'BULLISH',
    targetPrice: 1980,
    timeframe: 'Swing',
    isPinned: false,
    likes: ['user4', 'user9'],
    likeCount: 27,
    commentsCount: 2,
    status: 'active'
  },
  {
    authorName: 'OptionsKing_Arjun',
    authorRole: 'Derivatives Specialist',
    content: '📊 NIFTY 50 options data showing massive open interest at 25000 Call strike! Expecting consolidation between 24600 and 25000 before monthly expiry.',
    taggedStock: 'NIFTY50',
    sentiment: 'NEUTRAL',
    targetPrice: 25000,
    timeframe: 'Intraday',
    isPinned: false,
    likes: ['user1', 'user2', 'user5'],
    likeCount: 56,
    commentsCount: 4,
    status: 'active'
  },
  {
    authorName: 'FMCG_Investor',
    authorRole: 'Value Investor',
    content: '🚬 ITC dividend yield remains top tier in Nifty 50. Hotel business demerger will unlock value for shareholders in coming quarters. Holding long term!',
    taggedStock: 'ITC',
    sentiment: 'BULLISH',
    targetPrice: 540,
    timeframe: 'Long Term',
    isPinned: false,
    likes: ['user3', 'user10'],
    likeCount: 31,
    commentsCount: 1,
    status: 'active'
  }
];

const seedSocial = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB for Social Media Seeding');

    // Optional clear existing sample posts
    await SocialPost.deleteMany({ authorName: { $in: ['Rakesh_Trader', 'MarketGuru_IN', 'DalalStreetPro', 'TechBull_Vikram', 'OptionsKing_Arjun', 'FMCG_Investor'] } });
    await SocialComment.deleteMany({});

    const createdPosts = await SocialPost.insertMany(samplePosts);
    console.log(`🎉 Successfully seeded ${createdPosts.length} social posts!`);

    // Add comments to first post
    if (createdPosts.length > 0) {
      const p1 = createdPosts[0];
      await SocialComment.insertMany([
        {
          post: p1._id,
          authorName: 'TraderPriya',
          content: 'Agreed! RSI is above 65 and momentum looks solid.'
        },
        {
          post: p1._id,
          authorName: 'Amit_Capital',
          content: 'What is your stop loss recommendation for this trade?'
        },
        {
          post: p1._id,
          authorName: 'Rakesh_Trader',
          content: 'Keep a strict stop loss below 2940 on daily closing basis.'
        }
      ]);
      console.log('💬 Seeded initial sample comments!');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding social data:', err);
    process.exit(1);
  }
};

seedSocial();
