// eslint-disable-next-line import/no-extraneous-dependencies
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const categoryModel = require('../models/categoryModel');
const fatcory = require('./handlersFactory');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddelware');
const asyncHandler = require("express-async-handler");
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
const ApiError = require('../utils/apiError');





//upload category image
exports.uplodCategotyImage = uploadSingleImage("image");

/* // resize category image
exports.resizeCategoryImage = async (req, res, next) => {
    const fileName = `category-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
        .resize(1000, 600)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`uploads/categories/${fileName}`);

    req.body.image = fileName;

    next();
};
 */
exports.uploadImage =asyncHandler( async (req, res, next) => {
if(req.file ){
    const containerName = 'categories';
    const fileName = `category-${uuidv4()}-${Date.now()}.jpeg`;

    const sharedKeyCredential = new StorageSharedKeyCredential(process.env.STORAGE_NAME, process.env.STORAGE_ACCESS_KEY);
    const blobServiceClient = new BlobServiceClient(`https://${process.env.STORAGE_NAME}.blob.core.windows.net`, sharedKeyCredential);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Upload the image to Azure Blob Storage
    const resizedImage = await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat('jpeg')
        .jpeg({ quality: 100 })
        .toBuffer();

    // Upload the edited image to Azure Blob Storage
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.uploadData(resizedImage, {
        blobHTTPHeaders: {
            blobContentType: 'image/jpeg', // Set the content type of the blob
        },
    });

    const downloadUrl = blockBlobClient.url;

    if (!downloadUrl)
        return next(new ApiError('Image upload failed ', 400));

    req.body.image = downloadUrl;
}
    next();


});

// create category
exports.createCategoty = fatcory.createOne(categoryModel);


// get all categories
exports.getCategory = fatcory.getAll(categoryModel);


// get category by id
exports.getCategoryById = fatcory.getOne(categoryModel);


// update category
exports.updateCategory = fatcory.updateOne(categoryModel);


// delete category
exports.deleteCategory = fatcory.deleteOneDoc(categoryModel);