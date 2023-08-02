const express = require("express");

const router = express.Router();
const {
  createBrandValidator,
  getBrandValidator,
  updateBrandValidator,
} = require("../utils/validator/brandValidator");
const {
  uplodBrandImage,
  uploadImage,
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} = require("../services/brandServices");

const authService = require("../services/authServices");

router
  .route("/create")
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uplodBrandImage,
    uploadImage,
    createBrandValidator,
    createBrand
  );

router.route("/").get(getBrands);

router.route("/:id").get(getBrandValidator, getBrandById);

router
  .route("/update/:_id")
  .put(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uplodBrandImage,
    uploadImage,
    updateBrandValidator,
    updateBrand
  );

router
  .route("/delete/:id")
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    getBrandValidator,
    deleteBrand
  );

module.exports = router;
