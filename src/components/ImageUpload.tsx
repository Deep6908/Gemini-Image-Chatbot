import React, { useCallback, useState } from 'react';
import { Upload, X, ZoomIn, FileImage } from 'lucide-react';
import { UploadedImage } from '../types';

interface ImageUploadProps {
  onImageUpload: (file: File, dataUrl: string) => void;
  uploadedImage: UploadedImage | null;
  onRemoveImage: () => void;
  onImageClick: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  uploadedImage,
  onRemoveImage,
  onImageClick,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageUpload(file, e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageUpload(file, e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  if (uploadedImage) {
    return (
      <div className="space-y-3 fade-in">
        {/* Image Preview */}
        <div className="image-preview-container cursor-pointer" onClick={onImageClick}>
          <img
            src={uploadedImage.dataUrl}
            alt="Uploaded"
            className="w-full h-56 object-cover"
          />
          <div className="image-preview-overlay">
            <div className="flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-white/80" />
              <span className="text-xs text-white/80 font-medium">Click to enlarge</span>
            </div>
          </div>
        </div>

        {/* File Info */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <FileImage className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-300 truncate">{uploadedImage.file.name}</p>
              <p className="text-[10px] text-gray-500">{(uploadedImage.file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRemoveImage(); }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Replace button */}
        <button
          onClick={() => document.getElementById('file-input')?.click()}
          className="w-full py-2 text-xs font-medium text-gray-400 hover:text-gray-300 rounded-xl transition-all"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          Replace image
        </button>

        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div
      className={`upload-zone relative p-8 text-center ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
      
      <div className="relative z-10 space-y-4">
        <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isDragging 
            ? 'bg-purple-500/20 border border-purple-500/30' 
            : 'bg-white/[0.04] border border-white/[0.06]'
        }`}>
          <Upload className={`w-6 h-6 transition-colors ${isDragging ? 'text-purple-400' : 'text-gray-500'}`} />
        </div>
        
        <div>
          <p className="text-sm font-semibold text-gray-300 mb-1">
            {isDragging ? 'Drop your image' : 'Upload an image'}
          </p>
          <p className="text-xs text-gray-500">
            Drag & drop or <span className="text-purple-400">browse</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;