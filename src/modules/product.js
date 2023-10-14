// !mdbgum
const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
    },
    slug:{
        type:String,
        required:true,
        // unique:true,
        lowercase: true
    },
    description: {
      type: Array,
      required: true
    },
    brand: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    thumb: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      default: 0
    },
    sold: {
      type: Number,
    },
    images: {
      type: Array
    },
    color: {
      type: Array,
    },
    ram: {
      type: Array
    },
    descriptionDetail: {type: String},
    warranty: {type: String},
    delivery: {type: String},
    payment: {type: String},
    internal: {
      type: Array,
    },
    rating: [
      {
        star: {type: Number},
        votedBy: {type: mongoose.Types.ObjectId, ref: "User"},
        comment: {type: String},
        updatedAt: {type: Date,}
      }
    ],
    totalRating: {
      type: Number,
      default: 0
    }
} ,{
  timestamps: true
});

//Export the model
module.exports = mongoose.model('Product', productSchema);