const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Post = require('../models/post');
const Comment = require('../models/comment');

exports.posts_get = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    res.json({
      _id: post._id,
      title: post.title,
      text: post.text,
      created_at: post.created_at,
      updated_at: post.updated_at,
      _links: {
        related: {
          comments: {
            href: post.comments_url,
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

exports.posts_get_comments = asyncHandler(async (req, res) => {
  const [post, comments] = await Promise.all([
    Post.findById(req.params.id),
    Comment.find({ post: req.params.id }),
  ]);

  if (post) {
    res.json({
      post: {
        _id: post._id,
        title: post.title,
        text: post.text,
        created_at: post.created_at,
        updated_at: post.updated_at,
        comments,
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

exports.posts_list = asyncHandler(async (req, res) => {
  const {
    title, sortField, page, documentsPerPage,
  } = req.query;
  const docs = Number(documentsPerPage) || 20;
  const skip = (page || 0) * docs;
  const aggregationPipeline = [
    { $skip: skip },
    { $limit: docs },
    { $set: { id: { $toString: '$_id' } } },
    { $set: { url: { $concat: ['/api/posts/', '$id'] } } },
    { $set: { comments_url: { $concat: ['/api/posts/', '$id', '/comments'] } } },
  ];
  if (title) {
    aggregationPipeline.push({
      $match: { title },
    });
  }
  if (sortField) {
    aggregationPipeline.push({
      $sort: { [sortField]: 1 },
    });
  }
  const allPosts = await Post.aggregate(aggregationPipeline);
  const posts = allPosts.map((post) => ({
    _id: post._id,
    title: post.title,
    text: post.text,
    created_at: post.created_at,
    updated_at: post.updated_at,
    _links: {
      self: {
        href: post.url,
      },
      related: {
        comments: {
          href: post.comments_url,
        },
      },
    },
  }));
  res.json({
    posts_list: posts,
  });
});

exports.posts_create = [
  body('title', 'Title is required').trim().isLength({ min: 1 }).escape(),
  body('text', 'A post body is required with at least 50 characters long').trim().isLength({ min: 50 }).escape(),
  body('author', 'Author is required').isLength({ min: 1 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const post = new Post({
      title: req.body.title,
      text: req.body.text,
      created_at: new Date(),
      author: req.body.author,
    });

    if (errors.isEmpty()) {
      await post.save();
      res.json({
        post,
      });
    } else {
      const errs = errors.array().map((err) => err.msg);
      res.status(400).json({
        errors: errs,
      });
    }
  }),
];

exports.posts_update = [
  body('title', 'Title is required').trim().isLength({ min: 1 }).escape(),
  body('text', 'A post body is required with at least 50 characters long').trim().isLength({ min: 50 }).escape(),
  body('author', 'Author is required').isLength({ min: 1 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const post = await Post.findById(req.params.id);

    if (errors.isEmpty()) {
      post.title = req.body.title;
      post.text = req.body.text;
      post.updated_at = new Date();
      post.author = req.body.author;

      await Post.findByIdAndUpdate(req.params.id, post, {});

      res.json({
        post,
      });
    } else {
      const errs = errors.array().map((err) => err.msg);
      res.status(400).json({
        errors: errs,
      });
    }
  }),
];

exports.posts_delete = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    await Post.findByIdAndRemove(req.params.id);
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
