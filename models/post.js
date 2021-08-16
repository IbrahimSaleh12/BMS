const mongoose = require('mongoose');
const Comment = require('./comment');
const { Schema } = mongoose;


mongoose.model('Comment', commentSchema);

const postSchema = new Schema({
  title: String,
  textBody: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
});


module.exports = mongoose.model('Post', postSchema);