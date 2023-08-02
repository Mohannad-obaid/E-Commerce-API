const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');


exports.idValidator = [
    check('addressId').isMongoId().withMessage('Invalid Id of Address'),
    validatorMiddleware,
];

exports.createAddressValidator = [
    check('alias').notEmpty().withMessage('Alias is required')
        .isLength({ min: 2 })
        .withMessage('Alias must be at least 2 chars long')
    ,
    check('details').notEmpty().withMessage('Details Address is required')
        .isLength({ min: 2 })
        .withMessage('Details Address must be at least 2 chars long')
    ,

    check('phone').notEmpty().withMessage('Phone is required')
        .isMobilePhone(['ar-EG', 'ar-PS'])
        .withMessage('Invalid Phone Number')
    ,

    check('city').notEmpty().withMessage('City is required')
        .isLength({ min: 2 })
        .withMessage('City must be at least 2 chars long')
    ,

    check('postalCode').notEmpty().withMessage('Postal Code is required')
    //.isPostalCode(['EG','PS']).withMessage('Invalid Postal Code')
    ,

    validatorMiddleware,
];

exports.updateAddressValidator = [
    check('addressId').isMongoId().withMessage('Invalid Id'),

    check('alias').notEmpty().withMessage('Alias is required'),
    check('details').notEmpty().withMessage('Details Address is required'),
    check('phone').notEmpty().withMessage('Phone is required')
        .isMobilePhone(['ar-EG', 'ar-PS']).withMessage('Invalid Phone Number'),
    check('city').notEmpty().withMessage('City is required'),
    check('postalCode').notEmpty().withMessage('Postal Code is required')
    //.isPostalCode(['EG','PS']).withMessage('Invalid Postal Code'),
    ,

    validatorMiddleware,
];


