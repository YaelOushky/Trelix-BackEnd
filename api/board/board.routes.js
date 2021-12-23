const express = require('express');
const {
    requireAuth,
    requireAdmin,
} = require('../../middlewares/requireAuth.middleware');
const { log } = require('../../middlewares/logger.middleware');
const {
    getBoards,
    getBoardById,
    addBoard,
    updateBoard,
    removeBoard,
    addReview,
} = require('./board.controller');
const router = express.Router();

// middleware that is specific to this router
// router.use(requireAuth);

router.get('/', log, getBoards);
router.get('/:id', getBoardById);
// router.post('/', requireAuth, requireAdmin, addBoard);
// router.put('/:id', requireAuth, requireAdmin, updateBoard);
// router.delete('/:id', requireAuth, requireAdmin, removeBoard)
router.post('/', addBoard);
router.put('/:id', updateBoard);
router.delete('/:id', removeBoard);

module.exports = router;
