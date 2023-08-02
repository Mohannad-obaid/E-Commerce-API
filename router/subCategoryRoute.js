const express = require("express");
const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require("../utils/validator/subCategoryValidator");
const {
  createSubCategory,
  getSubCategory,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  createFilterObject,
  setCategoryIdToBody,
} = require("../services/subCategoryServices");
const authService = require("../services/authServices");


const router = express.Router({ mergeParams: true });

router.route("/:id").get(getSubCategoryValidator, getSubCategoryById);

router.route("/").get(createFilterObject, getSubCategory);
router
  .route("/create")
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    setCategoryIdToBody,
    createSubCategoryValidator,
    createSubCategory
  );

router
  .route("/update/:_id")
  .put(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    updateSubCategoryValidator,
    updateSubCategory
  );
  
router
  .route("/delete/:id")
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteSubCategoryValidator,
    deleteSubCategory
  );

module.exports = router;
