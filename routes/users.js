const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');

router.get('/', userController.users_list);
router.get('/:id', userController.users_get);
router.get('/:id/posts', userController.users_get_posts);
router.post('/', userController.users_create);
router.put('/:id', userController.users_update);
router.delete('/:id', userController.users_delete);

module.exports = router;
