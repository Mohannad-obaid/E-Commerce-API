const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    name :{
        type : String,
        trim: true,
        required : [true, 'Please enter sub category name'],
        uniqe :[true, 'Sub category name already exists'],
        maxlength : [32, 'Sub category name cannot exceed 32 characters'],
        minlength: [2, 'Category name must be at least 2 characters'],

    },
    slug :{
        type : String,
        lowercase : true,
    },
    image : String,
    category : {
        type : mongoose.Schema.ObjectId,
        ref : 'Category',
        required : [true, 'Sub category must belong to a category'],
    },
},

{timestamps : true}

);

module.exports = mongoose.model('SubCategory', subCategorySchema);