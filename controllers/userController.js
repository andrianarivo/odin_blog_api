const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const Post = require('../models/post');

exports.users_get = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      _links: {
        related: {
          posts: {
            href: user.posts_url,
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

exports.users_get_posts = asyncHandler(async (req, res) => {
  const [user, posts] = await Promise.all([
    User.findById(req.params.id),
    Post.find({ author: req.params.id }),
  ]);

  if (user) {
    res.json({
      user: {
        name: user.name,
        email: user.email,
        bio: user.bio,
        posts,
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

exports.users_list = asyncHandler(async (req, res) => {
  const {
    name, sortField, page, documentsPerPage,
  } = req.query;
  const docs = Number(documentsPerPage) || 20;
  const skip = (page || 0) * docs;
  const aggregationPipeline = [
    { $skip: skip },
    { $limit: docs },
    { $set: { id: { $toString: '$_id' } } },
    { $set: { url: { $concat: ['/api/users/', '$id'] } } },
    { $set: { posts_url: { $concat: ['/api/users/', '$id', '/posts'] } } },
  ];
  if (name) {
    aggregationPipeline.push({
      $match: { name },
    });
  }
  if (sortField) {
    aggregationPipeline.push({
      $sort: { [sortField]: 1 },
    });
  }
  const allUsers = await User.aggregate(aggregationPipeline);
  const users = allUsers.map((user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    _links: {
      self: {
        href: user.url,
      },
      related: {
        posts: {
          href: user.posts_url,
        },
      },
    },
  }));
  res.json({
    users_list: users,
  });
});

exports.users_create = [
  body('name', 'Name is required with 2 characters minimum')
    .trim()
    .isLength({ min: 2 })
    .escape(),
  body('bio', 'Bio should be at least 50 characters')
    .optional()
    .trim()
    .isLength({ min: 50 })
    .escape(),
  body('email', 'Email is required').trim().isEmail().escape(),
  body('password', 'Password is required with 6 characters minimum').isLength({ min: 6 }),
  body('password_confirm', 'Passwords do not match').custom((value, { req }) => {
    const { password } = req.body;
    return value === password;
  }),
  asyncHandler((req, res, next) => {
    const errors = validationResult(req);
    const {
      name, bio, email, password,
    } = req.body;

    const user = new User({
      name,
      bio,
      email,
    });

    if (errors.isEmpty()) {
      bcrypt.hash(password, 10, async (err, passwordHash) => {
        if (err) {
          next(err);
        } else {
          user.password_hash = passwordHash;
          await user.save();
          res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            bio: user.bio,
          });
        }
      });
    } else {
      const errs = errors.array().map((err) => err.msg);
      res.status(400).json({
        errors: errs,
      });
    }
  }),
];

exports.users_update = [
  body('name', 'Name is required with 2 characters minimum')
    .trim()
    .isLength({ min: 2 })
    .escape(),
  body('bio', 'Bio should be at least 50 characters')
    .optional()
    .trim()
    .isLength({ min: 50 })
    .escape(),
  body('email', 'Email is required').trim().isEmail().escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const {
      name, bio, email,
    } = req.body;

    const user = await User.findById(req.params.id);

    if (user) {
      user.name = name;
      user.bio = bio;
      user.email = email;

      if (errors.isEmpty()) {
        await User.findByIdAndUpdate(req.params.id, user, {});
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          bio: user.bio,
        });
      } else {
        const errs = errors.array().map((err) => err.msg);
        res.json({
          errors: errs,
        });
      }
    } else {
      const error = new Error();
      error.status = 404;
      error.msg = 'User not found';
      res.json({
        error,
      });
    }
  }),
];

exports.users_delete = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await User.findByIdAndRemove(req.params.id);
    res.json({
      _id: req.params.id,
    });
  } else {
    const error = new Error();
    error.status = 404;
    error.msg = 'User not found';
    res.status(404).json({
      error,
    });
  }
});
