// eslint-disable-next-line import/no-extraneous-dependencies
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist/add
// @access  Private - user

exports.addToWishlist = asyncHandler( async (req, res, next) => {
    console.log(req.body);
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $addToSet: { wishlist: req.body.productId }
        },
        { new: true }
    );
    if (!user) {
        return next(new ApiError('User not found', 404));
    }

    res.status(200).json({ status: 'success', message: 'Product added successfully', data: user.wishlist });

});

// @desc    Remove product from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Protected/User
exports.removeProductFromWishlist = asyncHandler( async (req, res, next) => {
    // $pull => remove productId from wishlist array if productId exist
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull: { wishlist: req.params.productId },
        },
        { new: true }
    );

    res.status(200).json({
        status: 'success',
        message: 'Product removed successfully from your wishlist.',
        data: user.wishlist,
    });
});

// @desc    Get logged user wishlist
// @route   GET /api/v1/wishlist
// @access  Protected/User
exports.getLoggedUserWishlist = asyncHandler( async (req, res, next) => {
    const user = await User.findById(req.user._id).populate('wishlist');

    res.status(200).json({
        status: 'success',
        results: user.wishlist.length,
        data: user.wishlist,
    });
});
