const { v4: uuidv4 } = require('uuid');
const asyncHandler = require("express-async-handler");
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");


// eslint-disable-next-line import/no-extraneous-dependencies
const sharp = require('sharp');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const fatcory = require('./handlersFactory');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddelware');
const ApiError = require('../utils/apiError');
const createToken = require('../utils/createToken');



//upload category image
exports.uplodUserImage = uploadSingleImage("profileImage");

/* // resize category image
exports.resizeUserImage = async (req, res, next) => {
    const fileName = `user-${uuidv4()}-${Date.now()}.jpeg`;
    if (req.file) {
        await sharp(req.file.buffer)
            .resize(600, 600)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`uploads/users/${fileName}`);







        req.body.profileImage = fileName;

    }




    next();
}; */


exports.uploadImage =asyncHandler( async (req, res, next) => {

    if (req.file){
        
    const containerName = 'users';
    const fileName = `user-${uuidv4()}-${Date.now()}.jpeg`;

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

    req.body.profileImage = downloadUrl;
    }
    next();


});


exports.createUser = fatcory.createOne(userModel);

exports.getUsers = fatcory.getAll(userModel);

exports.getUserById = fatcory.getOne(userModel);

exports.updateUser = asyncHandler(async (req, res, next) => {
    const { _id } = req.params;
    const document = await userModel.findOneAndUpdate(
        { _id },
        {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            profileImage: req.body.profileImage,
            role: req.body.role,
            active: req.body.active,
            phone: req.body.phone,

        },
        { new: true }
    );

    if (!document) {
        return next(new ApiError('Document don\'t update', 400))
    }

    res.status(200).json({ data: document });
});



exports.changeUserPassword = asyncHandler(async (req, res, next) => {
    const { _id } = req.params;
    console.log(req.params);
    const document = await userModel.findOneAndUpdate(
        { _id },
        {
            password: await bcrypt.hash(req.body.password, 12),
            passwordChangedAt: Date.now()

        },
        { new: true }
    );

    if (!document) {
        return next(new ApiError('Document don\'t update', 400));
    }

    res.status(200).json({ data: document });
});

exports.deleteUser = fatcory.deleteOneDoc(userModel);


exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
    req.params.id = req.user._id;
    next();
});


exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {

    console.log(req.body);
    const user = await userModel.findOneAndUpdate(
        req.user._id,
        {
            password: await bcrypt.hash(req.body.password, 12),
            passwordChangedAt: Date.now()

        },
        { new: true }
    );

    if (!user) {
        return next(new ApiError('User not found !!', 400));
    }

    const token = createToken(user._id);

    res.status(200).json({ data: user, token });
});

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
    const user = await userModel.findOneAndUpdate(
        req.user._id,
        {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,

        },
        { new: true }
    );

    if (!user) {
        return next(new ApiError('User not found !!', 400));
    }

    res.status(200).json({ data: user });
});

exports.deactivateAccountUserLogged = asyncHandler(async (req, res, next) => {
    await userModel.findOneAndUpdate(req.user._id, { active: false });

    res.status(204).json({ data: `Don : ${true}` });
});
