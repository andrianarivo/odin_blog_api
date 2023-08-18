const express = require('express');
const postController = require('../controllers/postController');

const router = express.Router();

router.get('/', postController.posts_list);
router.get('/:id', postController.posts_get);
router.get('/:id/comments', postController.posts_get_comments);
router.post('/', postController.posts_create);
router.put('/:id', postController.posts_update);
router.delete('/:id', postController.posts_delete);

module.exports = router;
