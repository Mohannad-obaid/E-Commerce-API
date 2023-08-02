const express = require("express");

const router = express.Router({ mergeParams: true });

const {
  addReviewValidator,
  updateReviewValidator,
  deleteReviewValidator
} = require("../utils/validator/reviewValidator");


const {
  createReview,
  deleteReview,
  updateReview,
  getReview,
  getReviewById,
  createFilterObject,
  setProductIdAndUserIdToBody
} = require("../services/reviewServices");

const authService = require("../services/authServices");

router
  .route("/add")
  .post(
    authService.protect,
    authService.allowedTo("user"),
    setProductIdAndUserIdToBody,
    addReviewValidator,
    createReview
  );

router.route("/").get(createFilterObject,getReview);

router.route("/:id").get(getReviewById);

router
  .route("/update/:_id")
  .put(
    authService.protect,
    authService.allowedTo('user'),
    updateReviewValidator,
    updateReview,

  );

router
  .route("/delete/:id")
  .delete(
    authService.protect,
    authService.allowedTo('user', 'admin', 'manager'),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
