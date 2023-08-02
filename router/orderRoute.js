const express = require('express');

const {
  createCashOrder,
  filterOrderForLoggedUser,
  findAllOrders,
  findSpecificOrder,
  updateOrderToDelivered,
  updateOrderToPaid,
  checkoutSession,

} = require('../services/orderServices');
const authService = require('../services/authServices');

const router = express.Router();

router.use(authService.protect);

router
  .post('/:cartId',authService.allowedTo('user'), createCashOrder)
  .get('/',authService.allowedTo('admin','manager','user'),filterOrderForLoggedUser, findAllOrders)
  .get('/:id',findSpecificOrder)
  .patch('/:id/pay',authService.allowedTo('admin','manager'),updateOrderToPaid)
  .patch('/:id/deliver',authService.allowedTo('admin','manager'),updateOrderToDelivered)
  .get('/checkout-session/:cartId',authService.allowedTo('user'),checkoutSession);

module.exports = router;