const { Schema, model } = require('mongoose');

const CommentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  text: { type: String, required: true },
  created_at: { type: Date, required: true },
  updated_at: Date,
});

module.exports = model('Comment', CommentSchema);
