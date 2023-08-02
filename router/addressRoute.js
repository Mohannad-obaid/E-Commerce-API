const express = require('express');

const authService = require('../services/authServices');//authServices

const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
  updateLoggedUserAddress,
} = require('../services/addressService');


const {createAddressValidator,updateAddressValidator,idValidator} = require('../utils/validator/addressValidator');

const router = express.Router();

router.use(authService.protect, authService.allowedTo('user'));

router.route('/add').post(createAddressValidator,addAddress);

router.route('/').get(getLoggedUserAddresses);

router.route('/update/:addressId').put(updateAddressValidator,updateLoggedUserAddress);


router.delete('/delete/:addressId',idValidator, removeAddress);

module.exports = router;