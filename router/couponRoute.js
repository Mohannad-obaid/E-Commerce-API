const express = require("express");

const router = express.Router();
/* const {
  createBrandValidator,
  getBrandValidator,
  updateBrandValidator,
} = require("../utils/validator/brandValidator"); */
const {
  createCoupon,
  deleteCoupon,
  getCoupon,
  getCoupons,
  updateCoupon,
} = require("../services/couponServices");

const authService = require("../services/authServices");

router.use(authService.protect, authService.allowedTo("admin", "manager"));

router
  .route("/create")
  .post(
    createCoupon,
  );

router.route("/").get(getCoupons);

router.route("/:id").get(getCoupon);

router
  .route("/update/:_id")
  .put(
    updateCoupon
  );

router
  .route("/delete/:id")
  .delete(
    deleteCoupon
  );

module.exports = router;
