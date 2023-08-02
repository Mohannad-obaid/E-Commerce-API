const mongoose = require('mongoose');


// 1- create schema
const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter brand name'],
        unique: [true, 'Brand name already exists'],
        maxlength: [32, 'Brand name cannot exceed 32 characters'],
        minlength: [2, 'Brand name must be at least 2 characters'],
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
        const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
        doc.image = imageUrl;
    }
}

brandSchema.post('init',(doc)=>{
    setImagUrl(doc);
});

brandSchema.post('save',(doc)=>{
    setImagUrl(doc);
}); */

// 2- create model
const brandsModle = mongoose.model('Brands', brandSchema);


module.exports = brandsModle;