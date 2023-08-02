const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, "Min rating value is 1.0"],
      max: [5, "Max rating value is 5.0"],
      required: [true, "Review rating is required"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to user'],
    },
    // parent reference (one to many)
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to product'],
    },
  },
  { timestamps: true }
);

// Query middleware
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email ",
  });
  next();
});

reviewSchema.statics.calcAverageAndRatings = async function (productId) {
  const result = await this.aggregate([
    // get all reviews for this product
    {
      $match: { product: productId }
    },
    // calculate average ratings and ratings quantity
    {
      $group: {
        _id: '$product',
        avgRatings: { $avg: '$ratings' },
        ratingsQuantity: { $sum: 1 }
      }
    },
  ]);
  console.log(result);

  if (result.length > 0) {
  await this.model('Product').findByIdAndUpdate(productId, {
    ratings : result[0].avgRatings,
    numReviews : result[0].ratingsQuantity
  });
  }else{
    await this.model('Product').findByIdAndUpdate(productId, {
      ratings : 0,
      numReviews : 0
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calcAverageAndRatings(this.product);

});

reviewSchema.post('remove', async function () {
  await this.constructor.calcAverageAndRatings(this.product);
});

module.exports = mongoose.model("Review", reviewSchema);
