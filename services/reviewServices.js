const Review = require('../models/reviewModel');
const fatcory = require('./handlersFactory');

exports.createFilterObject = (req, res, next) => {
    let filterObject = {};

    if (req.params.productId)
        filterObject = { product : req.params.productId }
    req.filterObj = filterObject;
    next();
}

exports.setProductIdAndUserIdToBody = (req, res, next) => {
    if (!req.body.product) {
        req.body.product = req.params.productId;
    }


    if (!req.body.user) {
        req.body.user = req.user._id;
    }
    next();
}

exports.createReview = fatcory.createOne(Review);

exports.getReview = fatcory.getAll(Review);

exports.getReviewById = fatcory.getOne(Review);

exports.updateReview = fatcory.updateOne(Review);

exports.deleteReview = fatcory.deleteOneDoc(Review);