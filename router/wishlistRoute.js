const express = require("express");
const {
  addToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} = require("../services/wishlistServices");
const auth = require("../services/authServices");

const { productIdValidator } = require("../utils/validator/wishlistValidator");

const router = express.Router();

router.use(auth.protect, auth.allowedTo("user"));

router.post(
  "/add",
  productIdValidator,
  addToWishlist
);

router.delete(
  "/delete/:productId",
  productIdValidator,
  removeProductFromWishlist
);

router.get(
    "/",
    getLoggedUserWishlist
    );



module.exports = router;
