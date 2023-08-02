const { v4: uuidv4 } = require('uuid');
// eslint-disable-next-line import/no-extraneous-dependencies
const sharp = require('sharp');

const asyncHandler = require("express-async-handler");
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
const prodectModel = require('../models/productModel');
const fatcory = require('./handlersFactory');
const { uploadMultipleImages } = require('../middlewares/uploadImageMiddelware');
const ApiError = require('../utils/apiError');


exports.uploadImages = uploadMultipleImages([
    {
        name: 'imageCover',
        maxCount: 1
    },
    {
        name: 'images',
        maxCount: 3
    }]);


/* exports.resizeImages = async (req, res, next) => {
    // 1) Cover image processing
    if (req.files.imageCover) {
        const imageCoverName = `prodects-${uuidv4()}-${Date.now()}-cover.jpeg`;
        await sharp(req.files.imageCover[0].buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 95 })
            .toFile(`uploads/prodects/${imageCoverName}`);

        req.body.imageCover = imageCoverName;

    }

    // 2) Images processing for images array

    if (req.files.images) {
        req.body.images = [];
        await Promise.all(
            req.files.images.map(async (image, index) => {
                const imageName = `prodects-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
                await sharp(image.buffer)
                    .resize(2000, 1333)
                    .toFormat('jpeg')
                    .jpeg({ quality: 95 })
                    .toFile(`uploads/prodects/${imageName}`);
                req.body.images.push(imageName);
            })
        );

        next();


    }

    // next();

};
 */

//upload category image
exports.uploadImage =asyncHandler( async (req, res, next) => {

    const containerName = 'products';
    const imageCoverName = `products-${uuidv4()}-${Date.now()}-cover.jpeg`;

    const sharedKeyCredential = new StorageSharedKeyCredential(process.env.STORAGE_NAME, process.env.STORAGE_ACCESS_KEY);
    const blobServiceClient = new BlobServiceClient(`https://${process.env.STORAGE_NAME}.blob.core.windows.net`, sharedKeyCredential);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    if (req.files.imageCover) {
    // Upload the image to Azure Blob Storage
    const resizedImage = await sharp(req.files.imageCover[0].buffer)
        .resize(600, 600)
        .toFormat('jpeg')
        .jpeg({ quality: 100 })
        .toBuffer();

    // Upload the edited image to Azure Blob Storage
    const blockBlobClient = containerClient.getBlockBlobClient(imageCoverName);
    await blockBlobClient.uploadData(resizedImage, {
        blobHTTPHeaders: {
            blobContentType: 'image/jpeg', // Set the content type of the blob
        },
    });

    const downloadUrl = blockBlobClient.url;

    if (!downloadUrl)
        return next(new ApiError('Image upload failed ', 400));

    req.body.imageCover = downloadUrl;
    }

    if (req.files.images) {
        req.body.images = [];
        await Promise.all(
            req.files.images.map(async (image, index) => {
                const imageName = `prodects-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
                const resizedImage = await sharp(image.buffer)
                    .resize(2000, 1333)
                    .toFormat('jpeg')
                    .jpeg({ quality: 95 })
                    .toBuffer();


                    const blockBlobClient = containerClient.getBlockBlobClient(imageName);
                    await blockBlobClient.uploadData(resizedImage, {
                        blobHTTPHeaders: {
                            blobContentType: 'image/jpeg', // Set the content type of the blob
                        },
                    });
                
                    const downloadUrl = blockBlobClient.url;
                
                    if (!downloadUrl)
                        return next(new ApiError('Image upload failed ', 400));    

                req.body.images.push(downloadUrl);
            })
        );

    }


    next();


});


exports.createProduct = fatcory.createOne(prodectModel);

exports.getProducts = fatcory.getAll(prodectModel, 'products');

exports.getProductById = fatcory.getOne(prodectModel,'reviews');

exports.updateProduct = fatcory.updateOne(prodectModel);

exports.deleteProdect = fatcory.deleteOneDoc(prodectModel);