const express = require('express');

const passport = require('passport');
const postRouter = require('./posts');
const commentRouter = require('./comments');
const userRouter = require('./users');
const sessionRouter = require('./sessions');

const router = express.Router();

router.use('/sessions', sessionRouter);
router.use('/users', userRouter);

router.use(passport.authenticate('jwt', { session: false }));

router.use('/posts', postRouter);
router.use('/comments', commentRouter);

module.exports = router;
