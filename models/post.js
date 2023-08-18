const { Schema, model } = require('mongoose');

const PostSchema = new Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, required: true },
  updated_at: Date,
});

PostSchema.virtual('url').get(function handler() {
  // no_inline
  return `/api/posts/${this._id}`;
});

PostSchema.virtual('comments_url').get(function handler() {
  // no_inline
  return `/api/posts/${this._id}/comments`;
});

module.exports = model('Post', PostSchema);
