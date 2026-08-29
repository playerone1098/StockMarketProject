const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlistController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', watchlistController.getWatchlists);
router.post('/', watchlistController.createWatchlist);
router.get('/check/:symbol', watchlistController.checkStockInWatchlists);
router.get('/:id', watchlistController.getWatchlistById);
router.put('/:id', watchlistController.updateWatchlist);
router.delete('/:id', watchlistController.deleteWatchlist);
router.post('/:id/items', watchlistController.addStockToWatchlist);
router.delete('/:id/items/:symbol', watchlistController.removeStockFromWatchlist);

module.exports = router;
