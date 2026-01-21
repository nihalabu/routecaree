// src/lib/cloudinary.js

/**
 * Cloudinary Upload Utility
 * Uses Cloudinary Upload Widget for easy media uploads
 */

export const uploadToCloudinary = (file, options = {}) => {
    return new Promise((resolve, reject) => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            reject(new Error('Cloudinary configuration missing'));
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', options.folder || 'route-care');

        if (options.tags) {
            formData.append('tags', options.tags.join(','));
        }

        fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    reject(new Error(data.error.message));
                } else {
                    resolve({
                        url: data.secure_url,
                        publicId: data.public_id,
                        type: data.resource_type,
                        format: data.format,
                        width: data.width,
                        height: data.height,
                        bytes: data.bytes,
                        createdAt: data.created_at
                    });
                }
            })
            .catch(error => reject(error));
    });
};

/**
 * Open Cloudinary Upload Widget
 * More user-friendly for multiple uploads
 */
export const openUploadWidget = (options = {}) => {
    return new Promise((resolve, reject) => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            reject(new Error('Cloudinary configuration missing'));
            return;
        }

        if (typeof window === 'undefined' || !window.cloudinary) {
            reject(new Error('Cloudinary widget not loaded'));
            return;
        }

        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName,
                uploadPreset,
                folder: options.folder || 'route-care',
                sources: ['local', 'camera'],
                multiple: options.multiple || false,
                maxFiles: options.maxFiles || 5,
                maxFileSize: options.maxFileSize || 10000000, // 10MB
                clientAllowedFormats: options.formats || ['image', 'video'],
                maxImageWidth: 2000,
                maxImageHeight: 2000,
                cropping: false,
                showSkipCropButton: true,
                styles: {
                    palette: {
                        window: '#FFFFFF',
                        windowBorder: '#E2E8F0',
                        tabIcon: '#2563EB',
                        menuIcons: '#475569',
                        textDark: '#0F172A',
                        textLight: '#FFFFFF',
                        link: '#2563EB',
                        action: '#2563EB',
                        inactiveTabIcon: '#94A3B8',
                        error: '#DC2626',
                        inProgress: '#2563EB',
                        complete: '#10B981',
                        sourceBg: '#F8FAFC'
                    }
                }
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result.event === 'success') {
                    resolve({
                        url: result.info.secure_url,
                        publicId: result.info.public_id,
                        type: result.info.resource_type,
                        format: result.info.format,
                        width: result.info.width,
                        height: result.info.height,
                        bytes: result.info.bytes,
                        createdAt: result.info.created_at
                    });
                }
            }
        );

        widget.open();
    });
};

/**
 * Generate Cloudinary URL with transformations
 */
export const getCloudinaryUrl = (publicId, transformations = {}) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudName || !publicId) return '';

    const {
        width,
        height,
        crop = 'fill',
        quality = 'auto',
        format = 'auto'
    } = transformations;

    let transformString = `q_${quality},f_${format}`;

    if (width) transformString += `,w_${width}`;
    if (height) transformString += `,h_${height}`;
    if (crop) transformString += `,c_${crop}`;

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
};
