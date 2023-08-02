const slugify = require('slugify');
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Brand = require('../../models/brandsModel');
const ApiError = require('../apiError');

exports.getBrandValidator = [
    check('id').isMongoId().withMessage('Invalid id '),
    validatorMiddleware,
];

exports.createBrandValidator = [
    check('name').notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 chars long')
    .isAlpha('en-US', { ignore: ' -' })
    .withMessage('The name must contain only letters')
    .custom(async (value, { req }) => {
        const brand = await Brand.findOne({ name: value });
        if (brand)
            throw new ApiError('Brand already exists', 400);

        req.body.slug = slugify(value)
        return true;
    })
    ,
    validatorMiddleware,
];

exports.updateBrandValidator = [
    check('_id').isMongoId().withMessage('Invalid Id'),
    check('name').optional()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 chars long')
    .isAlpha('en-US', { ignore: ' -' })
    .withMessage('The name must contain only letters')
    .custom(async (value, { req }) => {
            req.body.slug = slugify(value)
            return true;
        })
    ,

    validatorMiddleware,
];


