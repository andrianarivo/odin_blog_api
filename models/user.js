const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  name: { type: String, required: true },
  bio: String,
  email: { type: String, required: true },
  password_hash: { type: String, required: true },
});

module.exports = model('User', UserSchema);
