const slugify = require("slugify");
const { check } = require("express-validator");
const bcrypt = require("bcrypt");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");
const ApiError = require("../apiError").default;
// const apiError = require("../apiError");

exports.getUserValidator = [
    check("id").isMongoId().withMessage("Invalid Id"),
    validatorMiddleware,
];

exports.createUserValidator = [
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

    check("phone")
        .optional()
        .isMobilePhone(["ar-EG", "ar-PS", "ar-JO"])
        .withMessage("Invalid Phone Number"),

    check("profileImage").optional(),

    check("role").optional().isIn(["user", "manager", "admin"]).withMessage("Invalid Role"),
    validatorMiddleware,
];

exports.changeUserPasswordValidator = [
    check("currentPassword")
        .notEmpty()
        .withMessage("Current Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 chars long"),

    check("confirmPassword")
        .notEmpty()
        .withMessage("You must enter the confirm your password"),
    check("password")
        .notEmpty()
        .withMessage("Confirm Password is required")
        .custom(async (val, { req }) => {
            // verfiy current password
            const user = await User.findById(req.params._id);

            if (!user) {
                throw new Error("User not found");
            }

            const isCurrentPassword = bcrypt.compare(req.body.currentPassword, user.password)

            if (!isCurrentPassword) {
                throw new Error("Current password is incorrect");
            }
            // verfiy new password

            if (val !== req.body.confirmPassword) {
                throw new Error("Confirm password is incorrect");
            }

            return true;


        }),

    validatorMiddleware,
];


exports.changeLoggedUserPasswordValidator = [
    check("currentPassword")
        .notEmpty()
        .withMessage("Current Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 chars long"),

    check("confirmPassword")
        .notEmpty()
        .withMessage("You must enter the confirm your password"),
    check("password")
        .notEmpty()
        .withMessage("Confirm Password is required")
        .custom(async (val, { req }) => {
            // verfiy current password
            const user = await User.findById(req.user._id);

            if (!user) {
                throw new Error("User not found");
            }

            const isCurrentPassword = await bcrypt.compare(req.body.currentPassword, user.password)

            if (!isCurrentPassword) {
                throw new Error("Current password is incorrect");
            }
            // verfiy new password

            if (val !== req.body.confirmPassword) {
                throw new Error("Confirm password is incorrect");
            }

            return true;


        }),

    validatorMiddleware,
];

exports.updateUserValidator = [
    check("_id").isMongoId().withMessage("Invalid Id"),
    check("name")
        .optional()
        .isLength({ min: 2 })
        .withMessage("Name must be at least 2 chars long")
        .isAlpha("en-US", { ignore: " -" })
        .withMessage("The name must contain only letters")
        .custom(async (value, { req }) => {
            req.body.slug = slugify(value);
            return true;
        }),
    check("email")
        .optional()
        .isEmail()
        .withMessage("Invalid Email")
        .custom((value) => {
            User.findOne({ email: value }).then((user) => {
                if (user) {
                    // eslint-disable-next-line prefer-promise-reject-errors
                    return Promise.reject("Email already in use");
                }
            });
        }),

    check("phone")
        .optional()
        .isMobilePhone(["ar-EG", "ar-PS", "ar-JO"])
        .withMessage("Invalid Phone Number"),

    check("profileImage").optional(),

    check("role").optional().isIn(["user", "admin"]).withMessage("Invalid Role"),

    check("password")
        .optional()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 chars long"),

    validatorMiddleware,
];

exports.updateLoggedUserDataValidator = [

    check("name")
        .optional()
        .isLength({ min: 2 })
        .withMessage("Name must be at least 2 chars long")
        .isAlpha("en-US", { ignore: " -" })
        .withMessage("The name must contain only letters")
        .custom(async (value, { req }) => {
            req.body.slug = slugify(value);
            return true;
        }),

    check("email")
        .optional()
        .isEmail()
        .withMessage("Invalid Email")
        .custom((value) => {
            User.findOne({ email: value }).then((user) => {
                if (user) {
                    // eslint-disable-next-line prefer-promise-reject-errors
                    return Promise.reject("Email already in use");
                }
            });
        }),

    check("phone")
        .optional()
        .isMobilePhone(["ar-EG", "ar-PS", "ar-JO"])
        .withMessage("Invalid Phone Number"),


    check("role").optional().custom((value, { req }) => {
        if (req.user.role === "admin") {
            return true;
        }
        throw new ApiError("You don't have permission to change role", 403);

    }),

    validatorMiddleware,
];
