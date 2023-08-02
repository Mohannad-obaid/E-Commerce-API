const express = require("express");

const router = express.Router();

const {
  createUser,
  deleteUser,
  getUserById,
  updateUser,
  uplodUserImage,
  getUsers,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deactivateAccountUserLogged,
  uploadImage
} = require("../services/userServices");

const authService = require("../services/authServices");

const {
  changeUserPasswordValidator,
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  changeLoggedUserPasswordValidator,
  updateLoggedUserDataValidator
} = require("../utils/validator/userValidator");

router
  .route("/getUsers")
  .get(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    getUsers
  );

router
  .route("/:id")
  .get(
    authService.protect,
    authService.allowedTo("admin"),
    getUserValidator,
    getUserById
  );

router
  .route("/me/profile")
  .get(
    authService.protect,
    authService.allowedTo("admin", "manager", "user"),
    getLoggedUserData,
    getUserById
  );


router
  .route("/create/")
  .post(
    authService.protect,
    authService.allowedTo("admin"),
    uplodUserImage,
    uploadImage,
    createUserValidator,
    createUser
  );

router
  .route("/update/:_id")
  .put(
    authService.protect,
    authService.allowedTo("admin"),
    uplodUserImage,
   // resizeUserImage,
   uploadImage,
    updateUserValidator,
    updateUser
  );

router
  .route("/update-Profile/")
  .put(
    authService.protect,
    updateLoggedUserDataValidator,
    updateLoggedUserData,
  );


router
  .route("/delete/:id")
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    getUserValidator,
    deleteUser
  );

router
  .route("/deactivate-Account/")
  .delete(
    authService.protect,
    authService.allowedTo("admin","user"),
    deactivateAccountUserLogged
  );

router
  .route("/changeMyPassword/")
  .put(authService.protect,authService.allowedTo("admin","user"),
  getUserValidator, changeLoggedUserPasswordValidator, updateLoggedUserPassword);

router
  .route("/change-password/:_id")
  .put(changeUserPasswordValidator, changeUserPassword);

module.exports = router;
