const mongoose = require("mongoose"); // Erase if already required
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const {avatarDefault} = require('../resource/resource')

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      unique: true,
    },
    avatar: {
      type: String,
      default: avatarDefault,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    cart: [
      {
        product: { type: mongoose.Types.ObjectId, ref: "Product" },
        count: Number,
        price: {
          type: String,
          default: 0,
        },
        color: String,
        ram: String,
        internal: String,
        totalPrice: {
            type: String,
            default: 0
        }
      },
    ],
    shoppingHistory: [
      {
        product: { type: mongoose.Types.ObjectId, ref: "Product" },
        status: {
          type: String,
          default: "Processing",
          enum: ["Canceled", 'Processing','Shipping', 'Succeeded']  
        },
        count: Number,
        color: String,
        price: Number,
        ram: String,
        internal: String,
        title: String,
        thumb: String,
        createdAt: Date,
        orderId: {type: mongoose.Types.ObjectId, ref: 'Order'}
      }
    ]
    ,
    address: [{ type: mongoose.Types.ObjectId, ref: "Address" }],
    wishlist: [{ type: mongoose.Types.ObjectId, ref: "Product" }],
    isBlocked: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    passwordChangeAt: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    passswordResetExpries: {
      type: String,
    },
    registerToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Trước khi lưu thực hiện đoạn code trong này
userSchema.pre("save", async function (next) {
  // Nếu không thay đổi password thì chạy vào đây
  if (!this.isModified("password")) {
    next();
  }
  // Tạo muối
  const salt = bcrypt.genSaltSync(10);
  // Đẩy muối vào password tạo mã ngẫu nhiên
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods = {
  isCorrectPassword: async function (password) {
    return await bcrypt.compare(password, this.password);
  },
  createPasswordChangedToken: function () {
    const resetPassword = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetPassword)
      .digest("hex");
    this.passswordResetExpries = Date.now() + 15 * 60 * 1000;
    return resetPassword;
  },
  removeCartItem: function (productId) {
    const cartItemIndex = this.cart.findIndex(
      (item) => item.product.toString() === productId
    );
    
    if (cartItemIndex !== -1) {
      this.cart.splice(cartItemIndex, 1);
    }
  },
  toggleWishlist: function (productId) {
    if (!this.wishlist.includes(productId)) {
      this.wishlist.push(productId);
    } else {
      const index = this.wishlist.indexOf(productId);
      if (index !== -1) {
        this.wishlist.splice(index, 1);
      }
    }
  },
  addToHistoryShopping: function ({products, orderId}) {
    if(products) {
      products?.forEach(item => {
        this.shoppingHistory.push({...item, createdAt: new Date(), orderId})
      })
    }
  },
  deleteWishlistItem: function (productId) {
    const index = this.wishlist.indexOf(productId);
    if (index !== -1) {
      this.wishlist.splice(index, 1);
    } else throw new Error('Không có sản phẩm trong danh sách yêu thích')
  }
};


//Export the model
module.exports = mongoose.model("User", userSchema);
