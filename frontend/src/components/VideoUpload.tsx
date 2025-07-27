import React, { useState, useRef } from 'react';
import { Upload, Video as VideoIcon, Loader2, X, Play } from 'lucide-react';
import { useFileUpload } from '../file-storage/FileUpload';
import { useFileList } from '../file-storage/FileList';

interface VideoUploadProps {
  onVideoUploaded: (path: string) => void;
  currentVideo?: string;
  placeholder?: string;
}

export default function VideoUpload({ onVideoUploaded, currentVideo, placeholder }: VideoUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadFile, isUploading } = useFileUpload();
  const { getFileUrl } = useFileList();

  // Load current video URL when currentVideo changes
  React.useEffect(() => {
    if (currentVideo) {
      getFileUrl({ path: currentVideo, size: BigInt(0), mimeType: 'video/*' })
        .then(setVideoUrl)
        .catch(console.error);
    } else {
      setVideoUrl(null);
    }
  }, [currentVideo, getFileUrl]);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('video/mp4')) {
      alert('Please select an MP4 video file');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Generate a unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop() || 'mp4';
      const filename = `event-videos/${timestamp}.${extension}`;

      await uploadFile(
        filename,
        file.type,
        uint8Array,
        async (progress) => {
          setUploadProgress(progress);
        }
      );

      onVideoUploaded(filename);
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

  const clearVideo = () => {
    onVideoUploaded('');
    setVideoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {videoUrl ? (
        <div className="relative">
          <video
            src={videoUrl}
            className="w-full h-48 object-cover rounded-lg border border-purple-500/30"
            controls
            preload="metadata"
          />
          <button
            type="button"
            onClick={clearVideo}
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
            accept="video/mp4"
            onChange={handleFileInput}
            className="hidden"
          />
          
          {isUploading ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 text-purple-400 mx-auto animate-spin" />
              <div className="space-y-2">
                <p className="text-purple-200">Uploading video...</p>
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
                  <VideoIcon className="w-8 h-8 text-purple-400" />
                )}
              </div>
              <div>
                <p className="text-purple-200 font-medium">
                  {dragOver ? 'Drop video here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-purple-300 mt-1">
                  {placeholder || 'MP4 videos up to 2MB'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
