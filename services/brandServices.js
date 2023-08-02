const { v4: uuidv4 } = require("uuid");
// eslint-disable-next-line import/no-extraneous-dependencies
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const {
    BlobServiceClient,
    StorageSharedKeyCredential,
} = require("@azure/storage-blob");
const brandModel = require("../models/brandsModel");
const fatcory = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddelware");
const ApiError = require("../utils/apiError");

//upload category image
exports.uplodBrandImage = uploadSingleImage("image");

/* // resize category image
exports.resizeCategoryImage = async (req, res, next) =>{
    const fileName = `brand-${uuidv4()}-${Date.now()}.jpeg`;
   await sharp(req.file.buffer)
    .resize(1000,600)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`uploads/brands/${fileName}`);

    req.body.image = fileName;

    next();
}; */

exports.uploadImage = asyncHandler(async (req, res, next) => {
    console.log('**********')
    if (req.file) {
        const containerName = "brands";
        const fileName = `brand-${uuidv4()}-${Date.now()}.jpeg`;

        const sharedKeyCredential = new StorageSharedKeyCredential(
            process.env.STORAGE_NAME,
            process.env.STORAGE_ACCESS_KEY
        );
        const blobServiceClient = new BlobServiceClient(
            `https://${process.env.STORAGE_NAME}.blob.core.windows.net`,
            sharedKeyCredential
        );
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // Upload the image to Azure Blob Storage
        const resizedImage = await sharp(req.file.buffer)
            .resize(600, 600)
            .toFormat("jpeg")
            .jpeg({ quality: 100 })
            .toBuffer();

        // Upload the edited image to Azure Blob Storage
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        await blockBlobClient.uploadData(resizedImage, {
            blobHTTPHeaders: {
                blobContentType: "image/jpeg", // Set the content type of the blob
            },
        });

        const downloadUrl = blockBlobClient.url;

        if (!downloadUrl)
            return next(new ApiError("Image brand upload failed ", 400));
        console.log(downloadUrl);
        req.body.image = downloadUrl;
    }
    next();
});

exports.createBrand = fatcory.createOne(brandModel);

exports.getBrands = fatcory.getAll(brandModel);

exports.getBrandById = fatcory.getOne(brandModel);

exports.updateBrand = fatcory.updateOne(brandModel);

exports.deleteBrand = fatcory.deleteOneDoc(brandModel);
