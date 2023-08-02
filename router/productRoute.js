const express = require("express");

const router = express.Router();
const {
  uploadImages,
  uploadImage,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProdect,
} = require("../services/prodectServices");
const {
  createProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validator/productValidator");

const authService = require("../services/authServices");

const reviewsRoute = require("./reviewRoute");

router.use("/:productId/reviews", reviewsRoute);


router.route("/").get(getProducts);
router.route("/:id").get(getProductValidator, getProductById);

router.use(authService.protect, authService.allowedTo("admin", "manager"));

router
  .route("/create")
  .post(
    uploadImages,
    uploadImage,
    createProductValidator,
    createProduct
  );

router
  .route("/update/:_id")
  .put(
    uploadImages,
    uploadImage,
    updateProductValidator,
    updateProduct
  );

router
  .route("/delete/:id")
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteProductValidator,
    deleteProdect
  );



module.exports = router;

/*
"title": "Mens Casual Premium Slim Fit T-Shirts",
"description": "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing. And Solid stitched shirts with round neck made for durability and a great fit for casual fashion wear and diehard baseball fans. The Henley style round neckline includes a three-button placket.",
"quntity": 250,
"price": 20,
"imageCover":"https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
"category": "6432d55679c9f8d0ef2e2d87",
"brand":      "6432d68779c9f8d0ef2e2da2",
"color":["a","b","c"],
"size":["1","2","3"],
"subCategory":["6432d5b079c9f8d0ef2e2d93"]
*/
