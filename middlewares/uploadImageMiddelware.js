
const multer = require('multer');
const ApiError = require('../utils/apiError').default;

const multerOption = () => {
    const multerStorage = multer.memoryStorage();

    const multerFilter = (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
            cb(null, true)
        } else {
            cb(new ApiError('Not an image! Please upload only images.', 400), false);
        }
    };

    const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

    return upload;
}



exports.uploadSingleImage = (filedName) => multerOption().single(filedName);


exports.uploadMultipleImages = (arrayOfFileds) => multerOption().fields(arrayOfFileds);




/*
const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // const uploadDir = path.join(__dirname, 'uploads', 'categories');
        cb(null, 'uploads/categories');
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        const fileName = `category-${uuidv4()}-${Date.now()}.${ext}`;
        cb(null, fileName);
    }

});
*/