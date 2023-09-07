const express = require('express');
const passport = require('passport');

const router = express.Router();

const userController = require('../controllers/userController');

router.post('/', userController.users_create);

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', userController.users_list);
router.get('/:id', userController.users_get);
router.get('/:id/posts', userController.users_get_posts);
router.put('/:id', userController.users_update);
router.delete('/:id', userController.users_delete);

module.exports = router;
