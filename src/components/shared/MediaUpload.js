// src/components/shared/MediaUpload.js
import { useState } from 'react';
import { openUploadWidget } from '@/lib/cloudinary';
import Button from './Button';

export default function MediaUpload({
    onUploadComplete,
    onUploadError,
    folder = 'route-care',
    multiple = false,
    maxFiles = 5,
    buttonText = 'Upload Media',
    buttonVariant = 'primary',
    buttonSize = 'md'
}) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        setUploading(true);

        try {
            const result = await openUploadWidget({
                folder,
                multiple,
                maxFiles,
                formats: ['image', 'video']
            });

            if (onUploadComplete) {
                onUploadComplete(result);
            }
        } catch (error) {
            console.error('Upload error:', error);
            if (onUploadError) {
                onUploadError(error);
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <Button
            variant={buttonVariant}
            size={buttonSize}
            onClick={handleUpload}
            disabled={uploading}
        >
            {uploading ? (
                <span className="flex items-center gap-2">
                    <div className="spinner h-4 w-4"></div>
                    Uploading...
                </span>
            ) : (
                buttonText
            )}
        </Button>
    );
}
