const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          default: 1,
        },
        color: String,
        size: String,
        productPrice: Number,
        totalPrice: Number,
        totalProductPriceAfterDiscount: Number,
        coupon: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Coupon',
                max:[2,'You can only use 2 coupons']
            }
        ],
      },
    ],
    totalCartPrice: Number,
    totalPriceAfterDiscount: Number,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);