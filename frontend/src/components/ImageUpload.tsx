import React, { useState, useRef } from 'react';
import { apiClient } from '../lib/api/client';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  label?: string;
  helperText?: string;
  required?: boolean;
  error?: string | null;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onUploadingChange,
  label = 'Product Photos',
  helperText = 'Upload at least one clear photo of the actual book/product you are selling.',
  required = true,
  error: parentError,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setUploadState = (uploading: boolean) => {
    setIsUploading(uploading);
    if (onUploadingChange) {
      onUploadingChange(uploading);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file must be under 10MB.');
      return;
    }

    setError(null);
    setUploadState(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res: any = await apiClient.post('/upload', {
            image: base64Data,
            filename: file.name,
          });

          if (res.data?.imageUrl) {
            onChange(res.data.imageUrl);
          } else {
            setError('Upload succeeded but no image URL was returned.');
          }
        } catch (err: any) {
          setError(err.message || 'Failed to upload image. Please try again.');
        } finally {
          setUploadState(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read file from disk.');
        setUploadState(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'Upload error.');
      setUploadState(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const activeError = error || parentError;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block">
            {label} {required && <span className="text-[#9B5C52]">*</span>}
          </label>
          {helperText && (
            <p className="font-sans text-[11px] text-[#8B7562] mt-0.5">{helperText}</p>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-sans font-semibold">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              mode === 'upload' ? 'bg-[#111111] text-[#F4EFE7]' : 'text-[#8B7562] hover:text-[#3B2A22]'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              mode === 'url' ? 'bg-[#111111] text-[#F4EFE7]' : 'text-[#8B7562] hover:text-[#3B2A22]'
            }`}
          >
            Direct URL
          </button>
        </div>
      </div>

      {activeError && (
        <div className="p-3 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-sans font-medium">
          {activeError}
        </div>
      )}

      {mode === 'url' ? (
        <div className="space-y-3">
          <input
            type="url"
            value={value}
            onChange={(e) => {
              setError(null);
              onChange(e.target.value.trim());
            }}
            placeholder="https://images.unsplash.com/photo-..."
            className="input-editorial text-xs"
          />
          {value && (
            <div className="space-y-1.5">
              <div className="relative w-32 h-32 rounded-2xl border border-[#D6C8B8] overflow-hidden bg-[#E7DED1] shadow-inner">
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => {
                    setError('The provided URL could not be loaded as an image. Please verify the link.');
                  }}
                />
              </div>
              <p className="font-sans text-[10px] text-[#8B7562]">Image Preview</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {value ? (
            <div className="relative rounded-2xl border border-[#D6C8B8] bg-[#E7DED1] p-3.5 flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#D6C8B8] shrink-0 border border-[#D6C8B8]">
                <img src={value} alt="Uploaded item" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#6E8A62]" />
                  <p className="font-sans text-xs font-semibold text-[#3B2A22] truncate">Photo Attached & Verified</p>
                </div>
                <p className="font-sans text-[11px] text-[#8B7562] truncate mt-0.5">{value}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary text-[11px] !py-1 !px-3"
                  >
                    Replace Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      onChange('');
                    }}
                    className="btn-ghost text-[11px] !p-1 text-[#9B5C52] hover:text-[#9B5C52]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
                activeError
                  ? 'border-[#9B5C52] bg-[#9B5C52]/5'
                  : isDragging
                  ? 'border-[#C8A46A] bg-[#C8A46A]/10'
                  : 'border-[#D6C8B8] hover:border-[#C8A46A] bg-[#E7DED1]/50 hover:bg-[#E7DED1]'
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin" />
                  <p className="font-sans text-xs text-[#8B7562]">Uploading photo to campus storage…</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 py-2">
                  <div className="w-10 h-10 rounded-xl bg-[#EDE5D9] border border-[#D6C8B8] text-[#8B7562] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-sans font-semibold text-xs text-[#3B2A22]">Click to upload product photo</span>
                    <span className="font-sans text-xs text-[#8B7562]"> or drag and drop</span>
                  </div>
                  <p className="font-sans text-[10px] text-[#8B7562]">PNG, JPG, WEBP or GIF up to 10MB (Required)</p>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};
