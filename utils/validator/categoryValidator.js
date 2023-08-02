const slugify = require('slugify');
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');


exports.getCategoryValidator = [
    check('id').isMongoId().withMessage('Invalid Id'),
    validatorMiddleware,
];

exports.createCategoryValidator = [
    check('name').notEmpty()
    .withMessage('Name is required')
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

exports.updateCategoryValidator = [
    check('_id').isMongoId().withMessage('Invalid id category '),
    check('name').notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 chars long')
    .isAlpha('en-US', { ignore: ' -' })
    .withMessage('The name must contain only letters')
    .custom(async (value, { req }) => {
            req.body.slug = slugify(value)
            return true;
        }),

    validatorMiddleware,
];


