const mongoose = require('mongoose');


// 1- create schema
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter category name'],
        unique: [true, 'Category name already exists'],
        maxlength: [32, 'Category name cannot exceed 32 characters'],
        minlength: [2, 'Category name must be at least 2 characters'],
    },
    // A and B => shoping.com/a-and-b
    slug:{
        type: String,
        lowercase: true,
    },
    image: String,
},
{timestamps: true}

);

/* const setImagUrl = (doc)=>{
    if(doc.image){
        const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
        doc.image = imageUrl;
    }
}

// findOne, findById, findByIdAndUpdate, findByIdAndDelete
categorySchema.post('init',(doc)=>{
    setImagUrl(doc);
});

// save, create
categorySchema.post('save',(doc)=>{
    setImagUrl(doc);
}); */


// 2- create model
const categoryModle = mongoose.model('Category', categorySchema);


module.exports = categoryModle;