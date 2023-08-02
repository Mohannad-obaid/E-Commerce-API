const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");
const Product = require("../../models/productModel");


exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid id format"),
  validatorMiddleware,
];

exports.productIdValidator = [
  check("productId")
    .notEmpty()
    .withMessage("Product id is required to add in wishlist")
    .isMongoId()
    .withMessage("Invalid product id format").custom(async (val, { req }) => {
      // Check if product exist
      const product = await Product.findById(val);
      if (!product) {
        return Promise.reject(new Error("There is no product with this id"));
      }

      // Check if logged user 
      const user = await User.findById(req.user._id);
      if (!user) {
        return Promise.reject(new Error("Please login :) "));
      }
    }),

  validatorMiddleware,
];
