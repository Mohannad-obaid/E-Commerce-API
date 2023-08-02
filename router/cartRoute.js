const express = require('express');

const {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearCart,
  updateCartItemQuantity,
  applyCouponToOneProduct,
  applyCoupon
} = require('../services/cartServices');
const authService = require('../services/authServices');

const router = express.Router();

router.use(authService.protect, authService.allowedTo('user'));
router
  .post('/add', addProductToCart)
  .get('/', getLoggedUserCart)
  .delete('/clear', clearCart)


router
  .patch('/update/:itemId', updateCartItemQuantity)
  .delete('/remove/:itemId', removeSpecificCartItem)
  .patch('/applyCouponProduct/:itemId', applyCouponToOneProduct)
  .patch('/applyCoupon/:itemId', applyCoupon);



module.exports = router;