const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
  commentText: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Comment', commentSchema);