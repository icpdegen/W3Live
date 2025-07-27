import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { useFileUpload } from '../file-storage/FileUpload';
import { useFileList } from '../file-storage/FileList';

interface ImageUploadProps {
  onImageUploaded: (path: string) => void;
  currentImage?: string;
  placeholder?: string;
}

export default function ImageUpload({ onImageUploaded, currentImage, placeholder }: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadFile, isUploading } = useFileUpload();
  const { getFileUrl } = useFileList();

  // Load current image URL when currentImage changes
  React.useEffect(() => {
    if (currentImage) {
      getFileUrl({ path: currentImage, size: BigInt(0), mimeType: 'image/*' })
        .then(setImageUrl)
        .catch(console.error);
    } else {
      setImageUrl(null);
    }
  }, [currentImage, getFileUrl]);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Generate a unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `event-images/${timestamp}.${extension}`;

      await uploadFile(
        filename,
        file.type,
        uint8Array,
        async (progress) => {
          setUploadProgress(progress);
        }
      );

      onImageUploaded(filename);
      setUploadProgress(0);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearImage = () => {
    onImageUploaded('');
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt="Uploaded"
            className="w-full h-48 object-cover rounded-lg border border-purple-500/30"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? 'border-purple-400 bg-purple-500/10'
              : 'border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          
          {isUploading ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 text-purple-400 mx-auto animate-spin" />
              <div className="space-y-2">
                <p className="text-purple-200">Uploading...</p>
                <div className="w-full bg-black/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-purple-300">{Math.round(uploadProgress)}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto">
                {dragOver ? (
                  <Upload className="w-8 h-8 text-purple-400" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-purple-400" />
                )}
              </div>
              <div>
                <p className="text-purple-200 font-medium">
                  {dragOver ? 'Drop image here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-purple-300 mt-1">
                  {placeholder || 'PNG, JPG, GIF up to 2MB'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
