const express = require("express");

const router = express.Router();

const {
    createCategoty,
    deleteCategory,
    getCategory,
    getCategoryById,
    uploadImage,
    updateCategory,
    uplodCategotyImage,
} = require("../services/categoryServices");
const {
    createCategoryValidator,
    getCategoryValidator,
    updateCategoryValidator,

} = require("../utils/validator/categoryValidator");
const subcategoriesRoute = require("./subCategoryRoute");
const {
    deleteSubCategoryValidator,
} = require("../utils/validator/subCategoryValidator");

const authService = require("../services/authServices");

router.use("/:categoryId/subCategory/", subcategoriesRoute);
//router.use('/:categoryId/subcategories',    subcategoriesRoute);

//router.use(authService.protect, authService.allowedTo('admin', 'manager');

router
    .route("/")
    .get(getCategory);

    router
    .route("/:id")
    .get(getCategoryValidator, getCategoryById);


router.use(authService.protect, authService.allowedTo('admin', 'manager'));

router
    .route("/create")
    .post(
        uplodCategotyImage,
        uploadImage,
        createCategoryValidator,
        createCategoty
    );

    router
    .route("/:_id")
    .put(
        uplodCategotyImage,
        uploadImage,
        updateCategoryValidator,
        updateCategory
    );

    router
    .route("/delete/:id")
    .delete(deleteSubCategoryValidator, deleteCategory);

module.exports = router;
