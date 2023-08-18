const express = require('express');
const commentController = require('../controllers/commentController');

const router = express.Router();

/* GET users listing. */
router.get('/', commentController.comments_list);
router.get('/:id', commentController.comments_get);
router.post('/', commentController.comments_create);
router.put('/:id', commentController.comments_update);
router.delete('/:id', commentController.comments_delete);

module.exports = router;
