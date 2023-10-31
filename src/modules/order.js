const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema({
    products:[{
      product: {type: mongoose.Types.ObjectId, ref: 'Product'},
      count: Number,
      color: String,
      price: Number,
      ram: String,
      internal: String,
      title: String,
      thumb: String
    }],
    status:{
        type:String,
        default: 'Processing',
        enum: ["Canceled", 'Processing','Shipping', 'Succeeded'] ,
        text: true
    },
    total:{
      type: Number
    },
    coupon: {
      type: mongoose.Types.ObjectId,
      ref: 'Coupon'
    },
    orderBy:{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    address: {
      type: String,
      required: true
    },
    receiver: {
      type: String,
      required: true
    },
    mobile: {
      type: String,
      required: true
    },
    isPaid: {
      type: Boolean,
      default: false,
      required: true
    },
    paymentType: {
      type: String,
      default: 'receive',
      enum: ['receive', 'online'] 
    },
    paymentId: {
      type: String,
    },
    isReceive: {
      type: Boolean,
      default: false
    }
},  {
  timestamps: true,
});

//Export the model
module.exports = mongoose.model('Order', orderSchema);