const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
  title: String,
  textBody: String
});


module.exports = mongoose.model('Post', postSchema);