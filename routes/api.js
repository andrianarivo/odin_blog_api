const express = require('express');

const postRouter = require('./posts');
const commentRouter = require('./comments');
const userRouter = require('./users');

const router = express.Router();

router.use('/users', userRouter);
router.use('/posts', postRouter);
router.use('/comments', commentRouter);

module.exports = router;
