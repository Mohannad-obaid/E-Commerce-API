const stripe = require("stripe")(process.env.STRIPE_SECRET);

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const factory = require("./handlersFactory");
const User = require("../models/userModel");

const checkQuantityProduct = async (cartItems) => {
  const promises = cartItems.map(async (item) => {
    const product = await Product.findById(item.product);
    if (!product || product.quntity < item.quantity) {
      throw new ApiError(
        `Sorry, we don't have enough ${product.title} in stock.`,
        400
      );
    }
  });

  await Promise.all(promises);
};

// @desc    create cash order
// @route   POST /api/v1/orders/cartId
// @access  Protected/User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0.2;
  const shippingPrice = 0.1;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }

  // 2) Get order depend on cart price "check if coupon applied"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice =
    cartPrice + cartPrice * taxPrice + cartPrice * shippingPrice;

  // 3) Create order with default paymentMethodType cash
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
    taxPrice,
    shippingPrice,
  });

  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    // 4.1) Check if product quantity is enough
    await checkQuantityProduct(order.cartItems);

    const bulkOption = order.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quntity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);
  }

  /* const orderWithUser = await Order.findById(order._id).populate({
        path: "user",
        select: "name email addresses.alias addresses.details addresses.phone addresses.city addresses.postalCode ",
    }); */

  // 6) Send order to client
  res.status(201).json({
    status: "success",
    data: {
      order,
    },
  });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") {
    req.filterObj = { user: req.user._id };
  }
  next();
});

// @desc    Get all orders
// @route   POST /api/v1/orders
// @access  Protected/User-Admin-Manager
exports.findAllOrders = factory.getAll(Order);

// @desc    Get all orders
// @route   POST /api/v1/orders
// @access  Protected/User-Admin-Manager
exports.findSpecificOrder = factory.getOne(Order);

// @desc    Update order paid status to paid
// @route   PUT /api/v1/orders/:id/pay
// @access  Protected/Admin-Manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }

  // update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: "success", data: updatedOrder });
});

// @desc    Update order delivered status
// @route   PUT /api/v1/orders/:id/deliver
// @access  Protected/Admin-Manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }

  // update order to paid
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: "success", data: updatedOrder });
});


// @desc    Get checkout session from stripe and send it as response
// @route   GET /api/v1/orders/checkout-session/cartId
// @access  Protected/User
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0.2;
  const shippingPrice = 0.1;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }

  // 2) Get order depend on cart price "check if coupon applied"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + cartPrice * taxPrice + shippingPrice;

  console.log(totalOrderPrice);

  const product = await stripe.products.create({
    name: "Product in cart",
    description: "Comfortable cotton t-shirt",
    images: [
      "https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png",
    ],
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: totalOrderPrice * 100,
    currency: "usd",
  });

  // 3) Create stripe checkout session
  // https://stripe.com/docs/payments/checkout/migrating-prices
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // name: 'T-shirt',
        // description: 'Comfortable cotton t-shirt',
        // images: ['https://example.com/t-shirt.png'],
        //  amount: 2000,
        // currency: 'usd',
        price: price.id,
        quantity: 1,
      },
    ],

    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/api/v1/order`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/v1/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });
  // 4) Send session to client
  res.status(201).json({
    status: "success",
    data: {
      session,
    },
  });
});

// @desc Create order after stripe payment success paid
// @route POST /api/v1/orders/checkout-session/cartId
// @access Protected/User
const createCartOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const totalOrderPrice = session.amount_total / 100;

  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  if(!cart || !user) 
      return new ApiError("Cart or user not found", 404);

  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice,
    paymentMethodType: "card",
    isPaid: true,
    paidAt: Date.now(),
  });

  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    // 4.1) Check if product quantity is enough
    await checkQuantityProduct(order.cartItems);

    const bulkOption = order.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quntity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);
  }


};


// @desc    This webhook will run when stripe payment success paid
// @route   POST /webhook-checkout
// @access  Protected/User

exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    //  Create order
    await createCartOrder(event.data.object);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
});

