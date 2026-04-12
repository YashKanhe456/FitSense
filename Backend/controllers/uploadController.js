const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { isCloudinaryConfigured } = require('../utils/env');

const uploadsDir = path.join(__dirname, '..', 'uploads');

const buildSafeFilename = (originalName = 'upload') => {
    const extension = path.extname(originalName).toLowerCase() || '.jpg';
    const safeBaseName = path
        .basename(originalName, extension)
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase() || 'image';

    return `${Date.now()}-${safeBaseName}${extension}`;
};

const uploadToCloudinary = async (file) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = process.env.CLOUDINARY_FOLDER || 'patil-mens-wear';
    const signaturePayload = `folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(signaturePayload).digest('hex');
    const formData = new FormData();

    formData.append('file', `data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
    formData.append('api_key', process.env.CLOUDINARY_API_KEY);
    formData.append('timestamp', String(timestamp));
    formData.append('folder', folder);
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
    });

    const payload = await response.json();

    if (!response.ok) {
        throw new Error(payload.error?.message || 'Cloud upload failed.');
    }

    return {
        path: payload.public_id,
        url: payload.secure_url,
        filename: payload.public_id
    };
};

const saveLocally = async (file, req) => {
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = buildSafeFilename(file.originalname);
    const filePath = path.join(uploadsDir, filename);
    const publicPath = `/uploads/${filename}`;
    const origin = `${req.protocol}://${req.get('host')}`;

    await fs.writeFile(filePath, file.buffer);

    return {
        path: publicPath,
        url: `${origin}${publicPath}`,
        filename
    };
};

const uploadProductImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please select an image to upload.');
    }

    if (process.env.NODE_ENV === 'production' && !isCloudinaryConfigured()) {
        res.status(500);
        throw new Error('Image uploads require Cloudinary configuration in production.');
    }

    const uploadedFile = isCloudinaryConfigured()
        ? await uploadToCloudinary(req.file)
        : await saveLocally(req.file, req);

    res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
            path: uploadedFile.path,
            url: uploadedFile.url,
            filename: uploadedFile.filename
        }
    });
});

module.exports = { uploadProductImage };
