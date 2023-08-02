const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: [3, 'Too short prodect title'],
        maxlength: [200, 'Too long prodect title']
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
    },
    description: {
        type: String,
        required: [true, 'Please enter product description'],
        minlength: [20, 'Too short prodect description'],
    },
    quntity: {
        type: Number,
        required: [true, 'Please enter product quntity'],
    },
    sold: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        trim: true,
        max: [5000000, 'Too long prodect price']
    },
    priceAfterDiscount: {
        type: Number,
    },
    color: [String],
    size: [String],
    images: [{
        type: String,
        required: [true, 'Product Image is required'],
        min: [2, 'Product must have at least 2 images'],
    }],
    imageCover: {
        type: String,
        required: [true, 'Product Image Cover is required'],
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: [true, 'Product category is required'],
    },
    brand: {
        type: mongoose.Schema.ObjectId,
        ref: 'Brands',
      //  required: [true, 'Product brand is required'],

    },
    subCategory: [{
        type: mongoose.Schema.ObjectId,
        ref: 'SubCategory',
        required: [true, 'Product subCategory is required +++'],
    }]
    ,
    ratings: {
        type: Number,
        min: [0.5, 'Rating must be at least 1.0'],
        max: [5, 'Rating must be at most 5.0'],


    },
    numReviews: {
        type: Number,
        default: 0
    },

    isPublished: {
        type: Boolean,
        default: false
    },
},
    { 
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
    }
);


//Mongoose middlewares
productSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'category',
        select: 'name' // 'name -__id' to remove name from result
    }).populate({
        path: 'brand',
        select: 'name'
    }).populate({
        path: 'subCategory',
        select: 'name'
    });
    next();
});


/* const setImagUrl = (doc) => {
    if (doc.imageCover) {
        const imageUrl = `${process.env.BASE_URL}/prodects/${doc.imageCover}`;
        doc.imageCover = imageUrl;
    }

    if (doc.images) {
        const imagesUrl = doc.images.map((image) =>
            `${process.env.BASE_URL}/prodects/${image}`
        );
        doc.images = imagesUrl;
    }
}

productSchema.post('init', (doc) => {
    setImagUrl(doc);
});

productSchema.post('save', (doc) => {
    setImagUrl(doc);
}); */

productSchema.virtual('reviews',{
    ref:'Review',
    foreignField: 'product',
    localField: '_id'
});

module.exports = mongoose.model('Product', productSchema);