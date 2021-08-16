const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
  title: String,
  textBody: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});


module.exports = mongoose.model('Post', postSchema);