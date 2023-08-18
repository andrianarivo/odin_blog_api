const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  name: { type: String, required: true },
  bio: String,
  email: { type: String, required: true },
  password_hash: { type: String, required: true },
});

UserSchema.virtual('url').get(function handler() {
  // no_inline
  return `/api/users/${this._id}`;
});

UserSchema.virtual('posts_url').get(function handler() {
  // no_inline
  return `/api/users/${this._id}/posts`;
});

module.exports = model('User', UserSchema);
