const Coupon = require('../models/couponModel');
const fatcory = require('./handlersFactory');


// @desc    Post Create Coupon
// @route   Post /api/v1/Coupon/
// @access  Private/Admin-manager
exports.createCoupon = fatcory.createOne(Coupon);

/*
if(req.body.code){
        req.body.code = req.body.code.toUpperCase();
    }
    if(req.body.expier < Date.now()){
        return next(new ApiError('Please enter a valid expiration date', 400));
    }

    console.log(req.body);
    console.log(Date.now());
*/


// @desc    Get list of Coupon
// @route   Get /api/v1/Coupon/
// @access  Private/Admin-manager
exports.getCoupons = fatcory.getAll(Coupon);


/// @desc   Get One Coupon
// @route   Get /api/v1/Coupon/:id
// @access  Private/Admin-manager
exports.getCoupon = fatcory.getOne(Coupon);


// @desc    Update Coupon
// @route   PUT /api/v1/Coupon/update/:id
// @access  Private/Admin-manager
exports.updateCoupon = fatcory.updateOne(Coupon);

// @desc    Delete Coupon
// @route   DELETE /api/v1/Coupon/:productId
// @access  Private/Admin-manager
exports.deleteCoupon = fatcory.deleteOneDoc(Coupon);