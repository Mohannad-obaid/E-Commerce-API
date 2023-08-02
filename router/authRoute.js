const express = require("express");

const router = express.Router();

const { signup, login, forgotPassword, verifyResetCode, resetPassword } = require("../services/authServices");

const {
  signupValidator,
  loginValidator,

} = require("../utils/validator/authValidator");


router.route("/signup").post(signupValidator, signup);

router.route("/login").post(loginValidator, login);

router.route("/forgotpassword").post(forgotPassword);

router.route("/verifyResetCode").post(verifyResetCode);

router.route("/resetpassword").put(resetPassword);


module.exports = router;
