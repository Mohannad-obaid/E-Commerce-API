const subCategoryModel = require('../models/subCategoryModel');
const fatcory = require('./handlersFactory');

exports.setCategoryIdToBody = (req, res, next) => {
    if (!req.body.category) {
        req.body.category = req.params.categoryId;
    }
    next();
}

exports.createSubCategory = fatcory.createOne(subCategoryModel);

exports.createFilterObject = (req, res, next) => {
   
    if (req.params.categoryId){
        req.filterObj =  { category: req.params.categoryId };    
    }    
    next();
}

exports.getSubCategory = fatcory.getAll(subCategoryModel);

exports.getSubCategoryById = fatcory.getOne(subCategoryModel);

exports.updateSubCategory = fatcory.updateOne(subCategoryModel);

exports.deleteSubCategory = fatcory.deleteOneDoc(subCategoryModel);

