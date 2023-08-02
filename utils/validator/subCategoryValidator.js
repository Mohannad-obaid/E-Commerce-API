const slugify = require('slugify');
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const categoryModel = require('../../models/categoryModel');





exports.createSubCategoryValidator = [
    check('name').notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 chars long')
        .custom(async (value, { req }) => {
                req.body.slug = slugify(value)
                return true;       
        })
        ,

    check('category').notEmpty()
        .withMessage('Category is required')
        .isMongoId()
        .withMessage('Category must be a valid mongo id')
        .custom(async value => {
            const category = await categoryModel.findById(value);
            if (!category) {
                throw new Error('Category not found');
            }
        })
        .withMessage('Category not found')
    , validatorMiddleware





];

exports.getSubCategoryValidator = [
    check('id').isMongoId().withMessage('Invalid Id'),
    validatorMiddleware,
];

exports.updateSubCategoryValidator = [
    check('_id').isMongoId().withMessage('Invalid Id'),
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

    check('category')
        .isMongoId()
        .withMessage('Category must be a valid mongo id')
        .optional()
    ,

    validatorMiddleware,
];

exports.deleteSubCategoryValidator = [
    check('id').isMongoId().withMessage('Invalid Id'),
    validatorMiddleware,
];




/*
//async(req,res,next)=>{
   //    const {id} = req.body;
   //    const category = await categoryModel.findById(id);

   //if (!category) {
   //    return next(new ApiError('Category not found', 404));
   //}
   //next();
   //}
   //,
*/