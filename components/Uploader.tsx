
import React, { useState, useRef } from 'react';
import { ProcessingStatus } from '../types';

interface UploaderProps {
  onFileSelect: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  status: ProcessingStatus;
}

export const Uploader: React.FC<UploaderProps> = ({ onFileSelect, onUrlSubmit, status }) => {
  const [dragActive, setDragActive] = useState(false);
  const [url, setUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onUrlSubmit(url);
    }
  };

  const isBusy = status !== ProcessingStatus.IDLE && status !== ProcessingStatus.COMPLETED && status !== ProcessingStatus.ERROR;

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div 
        className={`relative group border-2 border-dashed rounded-2xl p-12 transition-all flex flex-col items-center justify-center gap-4 text-center
          ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-white'}
          ${isBusy ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isBusy && fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept="audio/*,video/*"
          onChange={handleChange}
          disabled={isBusy}
        />
        
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">Upload Media</h3>
          <p className="text-slate-500">Drag and drop audio or video files here</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">MP4</span>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">MP3</span>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">WAV</span>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">MOV</span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-slate-50 text-slate-500 font-medium italic">or enter a URL</span>
        </div>
      </div>

      <form onSubmit={handleSubmitUrl} className="flex gap-2">
        <input 
          type="url"
          placeholder="https://example.com/podcast.mp3"
          className="flex-grow px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isBusy}
        />
        <button 
          type="submit"
          className={`px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center gap-2
            ${isBusy ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
          `}
          disabled={isBusy}
        >
          <span>Analyze</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </form>
    </div>
  );
};
