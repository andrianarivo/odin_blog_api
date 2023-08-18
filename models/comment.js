const { Schema, model } = require('mongoose');

const CommentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  text: { type: String, required: true },
  created_at: { type: Date, required: true },
  updated_at: Date,
});

CommentSchema.virtual('url').get(function handler() {
  // no_inline
  return `/api/posts/${this._id}`;
});

CommentSchema.virtual('author_url').get(function handler() {
  // no_inline
  return `/api/users/${this.author}`;
});
CommentSchema.virtual('post_url').get(function handler() {
  // no_inline
  return `/api/posts/${this.post}`;
});

module.exports = model('Comment', CommentSchema);
