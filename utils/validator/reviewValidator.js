const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Review = require("../../models/reviewModel");
const Product = require("../../models/productModel");

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid id format for review *"),
  validatorMiddleware,
];

exports.addReviewValidator = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("ratings value is required")
    .isFloat({
      min: 1,
      max: 5,
    })
    .withMessage("Rating value must be between 1 to 5 "),

  check("user").isMongoId().withMessage("Invalid user Id"),
  check("product")
    .isMongoId()
    .withMessage("Invalid product Id")
    .custom(async (val, { req }) => {
      // Check if product exist
      const product = await Product.findById(val);
      if (!product) {
        return Promise.reject(new Error("There is no product with this id"));
      }

      
      // Check if logged user create review before
      const reviewSchema = await Review.findOne({
        user: req.user._id,
        product: req.body.product,
      });

      if (reviewSchema) {
        return Promise.reject(new Error("You already created a review before"));
      }
    }),

  validatorMiddleware,
];

exports.updateReviewValidator = [
  check('_id')
    .isMongoId()
    .withMessage('Invalid Review id format')
    .custom((val, { req }) =>
      // Check review ownership before update
      Review.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(new Error(`There is no review with id ${val}`));
        }

        if (review.user._id.toString() !== req.user._id.toString()){
          return Promise.reject(
            new Error(`Your are not allowed to perform this action`)
          );
        }
      })
    ),
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("ratings value is required")
    .isFloat({
      min: 1,
      max: 5,
    })
    .withMessage("Rating value must be between 1 to 5 "),


  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Review id format')
    .custom((val, { req }) => {
      // Check review ownership before update
      if (req.user.role === 'user') {
        return Review.findById(val).then((review) => {
          if (!review) {
            return Promise.reject(
              new Error(`There is no review with id ${val}`)
            );
          }
          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error(`Your are not allowed to perform this action`)
            );
          }
        });
      }
      return true;
    }),
  validatorMiddleware

];
