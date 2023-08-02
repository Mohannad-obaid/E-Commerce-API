const slugify = require("slugify");
const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");
// const apiError = require("../apiError");

exports.signupValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 chars long")
    .isAlpha("en-US", { ignore: " -" })
    .withMessage("The name must contain only letters")
    .custom(async (value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid Email")
    .custom(async (value) => {
      await User.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email already in use"));
        }
      });
    }),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 chars long")
    .custom((password, { req }) => {
      if (password !== req.body.confirmPassword) {
        throw Error("Confirm password is incorrect");
      } else {
        return true;
      }
    }),

  check("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required"),

  validatorMiddleware,
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid Email"),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 chars long"),

  validatorMiddleware,
];
