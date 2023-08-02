const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const Cart = require("../models/cartModel");

const calcTotalCartPrice = (cart) => {
    let totalCartPrice = 0;
    let afterDiscount = 0;    
    cart.cartItems.forEach((item) => {
        if(item.coupon.length > 0){
            afterDiscount += item.totalProductPriceAfterDiscount;
        }

        totalCartPrice += item.totalPrice;
        
    });
    

    cart.totalCartPrice = totalCartPrice;
    cart.totalPriceAfterDiscount = afterDiscount > 0 ? (totalCartPrice -afterDiscount ) : 0;
    return totalCartPrice;
};

// @desc    Add product to  cart
// @route   POST /api/v1/cart
// @access  Private/User

exports.addProductToCart = asyncHandler(async (req, res, next) => {
    const { ProductId, quantity, color, size } = req.body;
    const product = await Product.findById(ProductId);

    if (!product ) {
        return next(new ApiError("Product not found", 404));
    }

    if (product.quntity < quantity) {
        return next(new ApiError("Product quantity is not available", 400));
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        cart = await Cart.create({
            user: req.user._id,
            cartItems: [
                {
                    product: ProductId,
                    quantity,
                    color,
                    size,
                    productPrice: product.price,
                    totalPrice: product.price * quantity,
                },
            ],
        });
    } else {
        const productIndex = cart.cartItems.findIndex(
            (index) =>
                index.product.toString() === ProductId &&
                index.color === color &&
                index.size === size
        );

        if (productIndex !== -1) {
            if (quantity <= product.quntity && quantity > 0) {
                cart.cartItems[productIndex].quantity += quantity;
                const totalProduct = cart.cartItems[productIndex].quantity;
                cart.cartItems[productIndex].totalPrice = product.price * totalProduct;
            } else {
                return next(new ApiError("Product quantity is not available", 400));
            }
        } else {
            cart.cartItems.push({
                product: ProductId,
                quantity,
                color,
                size,
                productPrice: product.price,
                totalPrice: product.price * quantity,
            });
        }
    }
    calcTotalCartPrice(cart);
    await cart.save();

    res.status(200).json({
        status: "success",
        message: "Product added to cart successfully",
        numOfCartItems: cart.cartItems.length,
        data: cart,
    });
});

// @desc    Get logged user cart
// @route   GET /api/v1/cart
// @access  Private/User
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        return next(new ApiError(`There is no cart for this user `, 404));
    }

    res.status(200).json({
        status: "success",
        numOfCartItems: cart.cartItems.length,
        data: cart,
    });
});

// @desc    Remove specific cart item
// @route   DELETE /api/v1/cart/:itemId
// @access  Private/User
exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOneAndUpdate(
        { user: req.user._id },
        {
            $pull: { cartItems: { _id: req.params.itemId } },
        },
        { new: true }
    );

    calcTotalCartPrice(cart);
    cart.save();

    res.status(200).json({
        status: "success",
        numOfCartItems: cart.cartItems.length,
        data: cart,
    });
});

// @desc    clear logged user cart
// @route   DELETE /api/v1/cart
// @access  Private/User
exports.clearCart = asyncHandler(async (req, res, next) => {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.status(204).send();
});

// @desc    Update specific cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private/User
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return next(new ApiError(`there is no cart for user ${req.user._id}`, 404));
    }

    const itemIndex = cart.cartItems.findIndex(
        (item) => item._id.toString() === req.params.itemId
    );
    if (itemIndex > -1) {
        const cartItem = cart.cartItems[itemIndex];
        cartItem.quantity = quantity;
        cart.cartItems[itemIndex] = cartItem;
        cart.cartItems[itemIndex].totalPrice = cartItem.productPrice * quantity;
    } else {
        return next(
            new ApiError(`there is no item for this id :${req.params.itemId}`, 404)
        );
    }

    calcTotalCartPrice(cart);

    await cart.save();

    res.status(200).json({
        status: "success",
        numOfCartItems: cart.cartItems.length,
        data: cart,
    });
});

// @desc    Apply coupon on one product in cart
// @route   PUT /api/v1/cart/applyCoupon
// @access  Private/User
exports.applyCouponToOneProduct = asyncHandler(async (req, res, next) => {
    // 1) Get coupon based on coupon name
    const coupon = await Coupon.findOne({
        name: req.body.coupon,
        expire: { $gt: Date.now() },
    });

    if (!coupon || coupon.numberOfUsed === 0) {
        return next(new ApiError(`Coupon is invalid or expired`));
    }

    // 2) Get logged user cart to get total cart price
    const cart = await Cart.findOne({ user: req.user._id });


    const itemIndex = cart.cartItems.findIndex(
        (item) =>
            item._id.toString() === req.params.itemId &&
            item.coupon.length < 2 &&
            item.coupon.indexOf(coupon._id) === -1
    );


    if (itemIndex > -1) {
        const cartItem = cart.cartItems[itemIndex];
        cartItem.coupon.push(coupon._id);
        cart.cartItems[itemIndex] = cartItem;
        cart.cartItems[itemIndex].totalProductPriceAfterDiscount = ((cart.cartItems[itemIndex].totalPrice * (100 - coupon.discount)) / 100).toFixed(2);
    } else {
        return next(new ApiError("I have already used this coupon", 403));
    }

    
    calcTotalCartPrice(cart);

    await cart.save();

    coupon.numberOfUsed -= 1;
    await coupon.save();

    res.status(200).json({
        status: "success",
        numOfCartItems: cart.cartItems.length,
        data: cart,
    });
});

// @desc    Apply coupon on logged user cart
// @route   PUT /api/v1/cart/applyCoupon
// @access  Private/User
exports.applyCoupon = asyncHandler(async (req, res, next) => {
    // 1) Get coupon based on coupon name
    const coupon = await Coupon.findOne({
        name: req.body.coupon,
        expire: { $gt: Date.now() },
    });

    if (!coupon || coupon.numberOfUsed === 0) {
        return next(new ApiError(`Coupon is invalid or expired`));
    }

    // 2) Get logged user cart to get total cart price
    const cart = await Cart.findOne({ user: req.user._id });

    const totalPrice = cart.totalCartPrice;
    const totalPriceDiscount = cart.totalPriceAfterDiscount;

    // 3) Calculate price after priceAfterDiscount
    const totalPriceAfterDiscount = (
        totalPrice -
        (totalPrice * coupon.discount) / 100
    ).toFixed(2); // 99.23

    if (cart.totalPriceAfterDiscount > 0) {
        const totalPriceAfterAllDiscount = (
            totalPriceDiscount -
            (totalPriceDiscount * coupon.discount) / 100
        ).toFixed(2);

        cart.totalPriceAfterDiscount = totalPriceAfterAllDiscount;
    }

    cart.totalPriceAfterDiscount = totalPriceAfterDiscount;

    await cart.save();

    coupon.numberOfUsed -= 1;
    await coupon.save();

    res.status(200).json({
        status: "success",
        numOfCartItems: cart.cartItems.length,
        data: cart,
    });
});
