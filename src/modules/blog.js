const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var blogSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    content: {
      type: String,
      require: true
    },
    category: {
      type: String,
      required: true,
    },
    numberViews: {
      type: Number,
      default: 0
    },
    likes: [{
      type: mongoose.Types.ObjectId,
      ref: 'User'
    }],
    dislikes: [{
      type: mongoose.Types.ObjectId,
      ref: 'User'
    }],
    image: {
      type: Array,
      default: ['https://s3.amazonaws.com/kajabi-storefronts-production/blogs/8799/images/Re22ujQhupIWGTRnQpuw_Fotolia_52959972_XSThumb.jpg']
    },
    author: {
      type: String,
      default: 'Admin'
    }
}, {
  timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}
});

//Export the model
module.exports = mongoose.model('Blog', blogSchema);