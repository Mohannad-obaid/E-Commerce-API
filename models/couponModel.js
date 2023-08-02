const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Please enter coupon code"],
      unique: true,
      trim: true,
      maxlength: [20, "Coupon code cannot exceed 20 characters"],
    },
    discount: {
      type: Number,
      required: [true, "Please enter coupon discount"],
      min: [0, "Discount cannot be less than 0"],
      max: [100, "Discount cannot be more than 100"],
    },
    expire: {
      type: Date,
      required: [true, "Please enter coupon expire date"],
    },
    numberOfUsed: {
      type: Number,
      required: [true, "Please enter coupon number of use"],
      min: [0, "Number of use cannot be less than 0"],
    },
    usersUsed: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",

      }
    ],


  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);