/* eslint-disable no-undefined */
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const {sanitizeUser,sanitizeLogin}= require("../utils/sanitizeData");

const createToken = require("../utils/createToken");

// @desc  Signup
// @route GET /api/v1/auth/signup
// @access Public

exports.signup = asyncHandler(async (req, res, next) => {
  // 1- create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  

  // 2- Generate token
  const token = createToken(user._id);

  // 3- send response
  res.status(201).json({ data: sanitizeUser(user), token });
});

// @desc  login
// @route GET /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1- check if email and password exist

  // 2- check if user exist && password is correct
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Invalid credentials", 401));
  }

  // 3- Generate token
  const token = createToken(user._id);

  // 4- send response

  res.status(200).json({ data: sanitizeLogin(user), token });
});

// @desc  make sure user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1)check if token exist , if exist get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ApiError("You are not login, please login to get this route", 401)
    );
  }

  // 2)verify token (no change , expired)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3)check if user exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        "The user that belong to this token does no longer exist",
        401
      )
    );
  }

  // 4) check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    const passwordChangedTimeTamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passwordChangedTimeTamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently changed password! Please log in again.",
          401
        )
      );
    }
  }

  req.user = currentUser;

  next();
});

// @desc Authorization (user , admin , manager)
// ["admin", "manager"]

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)

    if (!roles.includes(req.user.role)) {
      console.log(req.user.role);
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }

    next();
  });

// @desc  Forgot Password
// @route GET /api/v1/auth/forgotpassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("There is no user with this email address", 404));
  }
  // 2) generate random  number 6 digit
  const randomCode = Math.floor(100000 + Math.random() * 900000);
  // 3) hash the random number (save to db)
  const hashedReasetCode =await crypto
    .createHash("sha256")
    .update(randomCode.toString())
    .digest("hex");

  user.passwordResetCode = hashedReasetCode;
  user.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  user.save();
  // 4) send it to user email

  const massageFormated = `
    Hi ${user.name}
    Your password reset code is 
            ${randomCode}
    This code will expire after 10 minutes
    `;

  try {
    sendEmail({
      email: user.email,
      subject: "Password reset code",
      message: massageFormated,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpire = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(new ApiError("Email could not be sent", 500));
  }
  // 5) send response to user

  res.status(200).json({
    status: "success",
    message: "Password reset code sent to your email address",
  });
});

// @desc  Verify Reset Code
// @route GET /api/v1/auth/verifyResetCode
// @access Public
exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  // 1) get user based on reset code
  const hashedReasetCode = await crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedReasetCode,
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("Invalid reset code or expired", 400));
  }

  // 2) Reset code valid or not
  user.passwordResetVerified = true;
  await user.save();

  // 3) send response to user
  res.status(200).json({
    status: "success",
  });
});

// @desc  Reset Password
// @route GET /api/v1/auth/resetpassword
// @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("There is no user with this email address", 404));
  }

  if (!user.passwordResetVerified) {
    return next(new ApiError("Please verify your reset code", 400));
  }

  user.password = req.body.newPassword;

  user.passwordResetCode = undefined;
  user.passwordResetExpire = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  createToken(user._id);
  res.status(200).json({status:"Password reset successfully",massage :"please login again"});
});


