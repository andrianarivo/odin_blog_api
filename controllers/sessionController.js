const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nconf = require('../envconf');
const User = require('../models/user');

exports.login = [
  body('email', 'Not a valid email').trim().isEmail().escape(),
  body('password', 'Password is required and of minimum length 6').isLength({ min: 6 }),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const user = await User.findOne({ email: req.body.email });
    if (errors.isEmpty()) {
      if (user) {
        const match = await bcrypt.compare(req.body.password, user.password_hash);
        if (match) {
          const secret = nconf.get('jwt_secret');
          const expiresIn = 1800;
          jwt.sign(
            {
              sub: user._id,
            },
            secret,
            { expiresIn },
            (err, token) => {
              if (err) {
                res.status(500).json({
                  errors: err,
                });
              } else {
                res.json({
                  token,
                });
              }
            },
          );
        } else {
          res.status(400).json({
            error: 'Username or password incorrect',
          });
        }
      } else {
        const error = new Error();
        error.status = 404;
        error.msg = 'User not found';
        res.status(404).json({
          error,
        });
      }
    } else {
      const errs = errors.array().map((err) => err.msg);
      res.status(400).json({
        errors: errs,
      });
    }
  }),
];

exports.logout = asyncHandler((req, res) => {
  res.send('unhandled logout');
});
