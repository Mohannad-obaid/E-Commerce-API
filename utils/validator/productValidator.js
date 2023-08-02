const { check } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const categoryModel = require("../../models/categoryModel");
const subCategoryModel = require("../../models/subCategoryModel");
const brandModel = require("../../models/brandsModel");
const productModel = require("../../models/productModel");
const ApiError = require("../apiError");

exports.createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Too short prodect title")
    .isLength({ max: 200 })
    .withMessage("Too long prodect title")
    .custom(async (value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),

  check("description")
    .notEmpty()
    .withMessage("Please enter product description")
    .isLength({ min: 20 })
    .withMessage("Too short prodect description"),

  check("quntity")
    .notEmpty()
    .withMessage("Please enter product quntity")
    .isNumeric()
    .withMessage("product quntity must be number"),

  check("price")
    .notEmpty()
    .withMessage("Please enter product price")
    .isNumeric()
    .withMessage("product price must be number")
    .isLength({ max: 2500 }),

  check("priceAfterDiscount")
    .optional()
    .toFloat()
    .isNumeric()
    .withMessage("product price must be a number")
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error("price After Discount must br lower than price");
      }
      return true;
    }),

  check("sold")
    .optional()
    .isNumeric()
    .withMessage("product quntity must be number"),

  check("imageCover").notEmpty().withMessage("Product Image Cover is required"),

    check("images")
    .notEmpty()
    .withMessage("Product Image is required")
    .custom((value) => {
        if (value.length < 2) {
            throw new Error("Product must have at least 2 images");
        }
        return true;
    }),


  check("color")
    .optional()
    .isArray()
    .withMessage("availableColor shoud be array os string"),

  check("size")
    .optional()
    .isArray()
    .withMessage("availableSize shoud be array os string"),

  //numReviews

  check("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Category must be a valid mongo id")
    .custom(async (value) => {
      const cat = await categoryModel.findById(value);

      if (!cat) {
        throw new ApiError(`category not found this id ${value}`);
      }
    }),
  /*
        check('SubCategory').notEmpty()
            .withMessage('SubCategory is required')
            .isMongoId().withMessage('SubCategory must be a valid mongo id')
            .custom(async value => {
    
                const subCategory = await subCategoryModel.findById(value);
    
                if (!subCategory) {
                    throw new ApiError('subCategory not found ', 404)
                }
            })
            */
  check("subCategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid ID subcategories formate")
    .custom((subcategoriesIds) =>
      subCategoryModel
        .find({ _id: { $exists: true, $in: subcategoriesIds } })
        .then((result) => {
          if (result.length < 1 || result.length !== subcategoriesIds.length) {
            // eslint-disable-next-line no-new
            new ApiError("subCategory not found ", 404);
          }
        })
    )
    .custom((val, { req }) =>
      subCategoryModel
        .find({ category: req.body.category })
        .then((subcategories) => {
          const subCategoriesIdsInDB = [];
          subcategories.forEach((subCategory) => {
            subCategoriesIdsInDB.push(subCategory._id.toString());
          });

          // check if subcategories ids in db include subcategories in req.body (true)
          const checker = (target, arr) => target.every((v) => arr.includes(v));
          if (!checker(val, subCategoriesIdsInDB)) {
            return Promise.reject(
              new Error(`subcategories not belong to category`)
            );
          }
        })
    ),

  check("brand")
    .optional()
    .isMongoId()
    .withMessage("Category must be a valid mongodb id")
    .custom(async (value) => {
      const brand = await brandModel.findById(value);
      if (!brand) {
        throw new ApiError("Brand not found", 404);
      }
    }),
  validatorMiddleware,
];

exports.getProductValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid id product")
    .custom(async (value, { req }) => {
      if (req.params.id) {
        const product = await productModel.findById(req.params.id);
        if (!product) {
          throw new ApiError("product not found", 404);
        }
      }
    }),
  validatorMiddleware,
];

exports.updateProductValidator = [
  check("_id").isMongoId().withMessage("Invalid Id"),
  check("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short prodect title")
    .isLength({ max: 10 })
    .withMessage("Too long prodect title")
    .custom(async (value, { req }) => {
      if (req.body.title) {
        req.body.slug = slugify(value);
        return true;
      }
    }),

  check("description")
    .optional()
    .isLength({ min: 20 })
    .withMessage("Too short prodect description"),

  check("quntity").optional(),

  check("price").optional(),

  check("imageCover").optional(),

  check("category")
    .optional()
    .isMongoId()
    .withMessage("Category must be a valid mongo id")
    .custom(async (value) => {
      const category = await categoryModel.findById(value);
      if (!category) {
        throw new ApiError("Category not found", 400);
      }
    }),

  check("SubCategory")
    .optional()
    .isMongoId()
    .withMessage("SubCategory must be a valid mongo id")
    .custom(async (value) => {
      const subCategory = await subCategoryModel.findById(value);
      if (!subCategory) {
        throw new ApiError("subCategory not found ", 404);
      }
    }),

  check("brand")
    .optional()
    .isMongoId()
    .withMessage("Category must be a valid mongo id")
    .custom(async (value) => {
      const brand = await brandModel.findById(value);
      if (!brand) {
        throw new ApiError("Brand not found 88", 404);
      }
    }),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid Id"),
  validatorMiddleware,
];
