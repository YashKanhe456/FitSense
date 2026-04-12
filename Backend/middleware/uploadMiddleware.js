const multer = require('multer');

const fileFilter = (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
        return callback(new Error('Only image files are allowed.'));
    }

    return callback(null, true);
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;
