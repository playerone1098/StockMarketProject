const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { auth } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Set up optional Multer storage for CSV / Excel uploads
let upload = { single: () => (req, res, next) => next() };
try {
  const multer = require('multer');
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `statement_${Date.now()}_${file.originalname}`)
  });

  upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
  });
} catch (e) {
  console.log('Multer not installed, falling back to JSON import body mode.');
}

router.use(auth);

router.get('/', portfolioController.getPortfolios);
router.post('/', portfolioController.createPortfolio);
router.get('/:id', portfolioController.getPortfolioById);
router.put('/:id', portfolioController.updatePortfolio);
router.delete('/:id', portfolioController.deletePortfolio);

router.post('/:id/holdings', portfolioController.addHolding);
router.put('/:id/holdings/:holdingId', portfolioController.updateHolding);
router.delete('/:id/holdings/:holdingId', portfolioController.deleteHolding);

router.post('/:id/import', upload.single('statement'), portfolioController.importHoldings);

module.exports = router;
