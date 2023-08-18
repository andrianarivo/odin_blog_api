const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/comment');

exports.comments_get = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (comment) {
    res.json({
      _id: comment._id,
      author: comment.author,
      post: comment.post,
      text: comment.text,
      created_at: comment.created_at,
      updated_at: comment.created_at,
      _links: {
        self: {
          href: comment.url,
        },
        related: {
          posts: {
            href: comment.post_url,
          },
          author: {
            href: comment.author_url,
          },
        },
      },
    });
  } else {
    const error = new Error();
    error.status = 404;
    error.msg = 'User not found';
    res.json({
      error,
    });
  }
});

exports.comments_list = asyncHandler(async (req, res) => {
  const {
    post, author, sortField, page, documentsPerPage,
  } = req.query;
  const docs = Number(documentsPerPage) || 20;
  const skip = (page || 0) * docs;
  const aggregationPipeline = [
    { $skip: skip },
    { $limit: docs },
    { $set: { id: { $toString: '$_id' } } },
    { $set: { author_id: { $toString: '$author' } } },
    { $set: { post_id: { $toString: '$post' } } },
    { $set: { url: { $concat: ['/api/comments/', '$id'] } } },
    { $set: { author_url: { $concat: ['/api/users/', '$author_id'] } } },
    { $set: { post_url: { $concat: ['/api/posts/', '$post_id'] } } },
  ];
  if (post) {
    aggregationPipeline.push({
      $match: { post },
    });
  }
  if (author) {
    aggregationPipeline.push({
      $match: { author },
    });
  }
  if (sortField) {
    aggregationPipeline.push({
      $sort: { [sortField]: 1 },
    });
  }
  const allComments = await Comment.aggregate(aggregationPipeline);
  const comments = allComments.map((comment) => ({
    _id: comment._id,
    author: comment.author,
    post: comment.post,
    text: comment.text,
    created_at: comment.created_at,
    updated_at: comment.created_at,
    _links: {
      self: {
        href: comment.url,
      },
      related: {
        posts: {
          href: comment.post_url,
        },
        author: {
          href: comment.author_url,
        },
      },
    },
  }));
  res.json({
    comments_list: comments,
  });
});

exports.comments_create = [
  body('author', 'Author is required').isLength({ min: 1 }),
  body('post', 'Post is required').isLength({ min: 1 }),
  body('text', 'A text is required with minimum 50 characters length').trim().isLength({ min: 50 }).escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const comment = new Comment({
      author: req.body.author,
      post: req.body.post,
      text: req.body.text,
      created_at: new Date(),
    });

    if (errors.isEmpty()) {
      await comment.save();
      res.json({
        comment,
      });
    } else {
      const errs = errors.array().map((err) => err.msg);
      res.status(400).json({
        errors: errs,
      });
    }
  }),
];

exports.comments_update = [
  body('author', 'Author is required').isLength({ min: 1 }),
  body('post', 'Post is required').isLength({ min: 1 }),
  body('text', 'A text is required with minimum 50 characters length').trim().isLength({ min: 50 }).escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const comment = await Comment.findById(req.params.id);

    if (errors.isEmpty()) {
      comment.text = req.body.text;
      comment.updated_at = new Date();
      comment.author = req.body.author;
      comment.post = req.body.post;

      await Comment.findByIdAndUpdate(req.params.id, comment, {});

      res.json({
        comment,
      });
    } else {
      const errs = errors.array().map((err) => err.msg);
      res.status(400).json({
        errors: errs,
      });
    }
  }),
];

exports.comments_delete = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (comment) {
    await Comment.findByIdAndRemove(req.params.id);
    res.json({
      _id: req.params.id,
    });
  } else {
    const error = new Error();
    error.status = 404;
    error.msg = 'Post not found';
    res.status(404).json({
      error,
    });
  }
});
