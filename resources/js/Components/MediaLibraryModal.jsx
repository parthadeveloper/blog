import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function MediaLibraryModal({ 
    isOpen, 
    onClose, 
    onInsertIntoContent, 
    onSetFeaturedImage, 
    onAddToGallery 
}) {
    if (!isOpen) return null;

    const [mediaItems, setMediaList] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [activeTab, setActiveTab] = useState('library'); // 'upload' or 'library'
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [focusedItem, setFocusedItem] = useState(null);

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchMedia();
            setSelectedItems([]);
            setFocusedItem(null);
        }
    }, [isOpen]);

    const fetchMedia = async () => {
        try {
            const res = await axios.get(route('media.index'));
            setMediaList(res.data);
            if (res.data.length > 0 && !focusedItem) {
                setFocusedItem(res.data[0]);
            }
        } catch (err) {
            console.error('Failed to load media list:', err);
        }
    };

    const handleUploadFiles = async (files) => {
        setUploading(true);
        const uploadPromises = Array.from(files).map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const res = await axios.post(route('media.store'), formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                return res.data;
            } catch (err) {
                console.error('Error uploading file:', err);
                return null;
            }
        });

        await Promise.all(uploadPromises);
        setUploading(false);
        setActiveTab('library');
        fetchMedia();
    };

    const handleSelectFiles = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleUploadFiles(e.target.files);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUploadFiles(e.dataTransfer.files);
        }
    };

    const handleToggleSelect = (item, e) => {
        e.stopPropagation();
        setFocusedItem(item);
        const isSelected = selectedItems.some(i => i.path === item.path);
        if (isSelected) {
            setSelectedItems(selectedItems.filter(i => i.path !== item.path));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };

    const handleItemClick = (item) => {
        setFocusedItem(item);
    };

    const handleDeleteItem = async (item, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this file permanently from storage?')) return;
        try {
            await axios.post(route('media.destroy'), { path: item.path });
            fetchMedia();
            if (focusedItem?.path === item.path) {
                setFocusedItem(null);
            }
            setSelectedItems(selectedItems.filter(i => i.path !== item.path));
        } catch (err) {
            console.error('Failed to delete media file:', err);
        }
    };

    const handleBatchAction = (action) => {
        const items = selectedItems.length > 0 ? selectedItems : (focusedItem ? [focusedItem] : []);
        if (items.length === 0) return;

        if (action === 'insert') {
            onInsertIntoContent(items);
        } else if (action === 'featured') {
            onSetFeaturedImage(items[0]);
        } else if (action === 'gallery') {
            onAddToGallery(items);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <div 
                className="absolute inset-0 bg-theme-main/60 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            />

            {/* WordPress Style Modal Container */}
            <div className="relative bg-theme-card border border-theme-border/75 rounded-3xl w-full max-w-6xl h-[85vh] flex flex-col shadow-theme-xl overflow-hidden animate-scale-up text-theme-text">
                
                {/* Header Section */}
                <div className="px-6 py-4 border-b border-theme-border/60 flex items-center justify-between bg-theme-main/15">
                    <div className="flex items-center space-x-6">
                        <h3 className="text-xl font-extrabold tracking-tight">📷 Media Manager</h3>
                        
                        {/* Tab Toggle buttons */}
                        <div className="flex space-x-1.5 bg-theme-accent/50 p-1 rounded-xl border border-theme-border/40">
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition duration-150 ${
                                    activeTab === 'upload' 
                                        ? 'bg-theme-primary text-white shadow-theme-xxs' 
                                        : 'text-theme-muted hover:text-theme-text'
                                }`}
                            >
                                Upload Files
                            </button>
                            <button
                                onClick={() => setActiveTab('library')}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition duration-150 ${
                                    activeTab === 'library' 
                                        ? 'bg-theme-primary text-white shadow-theme-xxs' 
                                        : 'text-theme-muted hover:text-theme-text'
                                }`}
                            >
                                Media Library ({mediaItems.length})
                            </button>
                        </div>
                    </div>
                    
                    {/* Close Modal button */}
                    <button 
                        onClick={onClose} 
                        className="text-theme-muted hover:text-theme-text bg-theme-accent/30 p-2 rounded-full hover:bg-theme-accent border border-theme-border transition"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Main Content Pane */}
                <div className="flex-grow flex overflow-hidden min-h-0">
                    
                    {/* Left: Interactive Workspace */}
                    <div className="flex-grow p-6 overflow-y-auto min-h-0 bg-theme-main/5">
                        
                        {/* Tab: Upload file interface */}
                        {activeTab === 'upload' && (
                            <div 
                                className={`h-full border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 transition duration-200 ${
                                    dragActive 
                                        ? 'border-theme-primary bg-theme-primary/10' 
                                        : 'border-theme-border/60 hover:border-theme-border bg-theme-card/50'
                                }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <svg className="w-16 h-16 text-theme-muted mb-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <h4 className="text-lg font-extrabold text-theme-text mb-1">Drag & Drop files to upload</h4>
                                <p className="text-sm text-theme-muted mb-4">or</p>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="px-6 py-2.5 bg-theme-accent hover:bg-theme-main border border-theme-border text-theme-text font-bold text-xs rounded-xl shadow-theme-sm transition"
                                >
                                    Select Files
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleSelectFiles}
                                    accept="image/*"
                                />
                                {uploading && (
                                    <div className="mt-6 flex items-center space-x-3 text-sm text-theme-primary">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="font-bold">Uploading files to Media Library...</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: Media Library view */}
                        {activeTab === 'library' && (
                            mediaItems.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                    {mediaItems.map((item) => {
                                        const isSelected = selectedItems.some(i => i.path === item.path);
                                        const isFocused = focusedItem?.path === item.path;
                                        return (
                                            <div
                                                key={item.path}
                                                onClick={() => handleItemClick(item)}
                                                className={`relative rounded-2xl overflow-hidden aspect-square border cursor-pointer group shadow-theme-xxs transition-all duration-150 ${
                                                    isFocused 
                                                        ? 'border-theme-primary ring-2 ring-theme-primary/30 scale-98' 
                                                        : 'border-theme-border/60 hover:border-theme-border hover:scale-102'
                                                }`}
                                            >
                                                {/* Select Trigger */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleToggleSelect(item, e)}
                                                    className={`absolute top-2.5 left-2.5 z-10 w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                                                        isSelected 
                                                            ? 'bg-theme-primary border-theme-primary text-white shadow-theme-xxs' 
                                                            : 'bg-black/40 border-white/50 text-transparent hover:bg-black/60'
                                                    }`}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>

                                                {/* Thumbnail Image */}
                                                <img
                                                    src={item.url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover select-none"
                                                />

                                                {/* Soft Hover delete button overlay */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDeleteItem(item, e)}
                                                    className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg bg-red-600/75 text-white opacity-0 group-hover:opacity-100 hover:bg-red-700 transition"
                                                    title="Delete permanently from storage"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-theme-card/30 border border-theme-border/40 rounded-3xl">
                                    <svg className="w-12 h-12 text-theme-muted mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-theme-muted italic text-sm">Media Library is empty. Go ahead and upload some beautiful assets!</p>
                                </div>
                            )
                        )}
                    </div>

                    {/* Right: WordPress details panel (Visible in library tab) */}
                    {activeTab === 'library' && (
                        <div className="w-80 border-l border-theme-border/60 bg-theme-main/15 p-6 flex flex-col overflow-y-auto justify-between h-full select-none shadow-theme-inner-md">
                            {focusedItem ? (
                                <div className="space-y-6">
                                    {/* Preview header */}
                                    <div className="space-y-2">
                                        <p className="text-xxs font-extrabold uppercase tracking-wider text-theme-muted">Attachment Details:</p>
                                        <div className="rounded-2xl overflow-hidden border border-theme-border/40 aspect-video shadow-theme-xxs bg-black">
                                            <img src={focusedItem.url} alt="Focused attachment" className="w-full h-full object-contain" />
                                        </div>
                                    </div>

                                    {/* Attachment details list */}
                                    <div className="space-y-1 text-xs">
                                        <p className="font-extrabold truncate" title={focusedItem.name}>{focusedItem.name}</p>
                                        <p className="text-theme-muted">Uploaded on: {focusedItem.created_at}</p>
                                        <p className="text-theme-muted">File Size: {focusedItem.size}</p>
                                    </div>

                                    {/* Selected indicators */}
                                    {selectedItems.length > 0 && (
                                        <div className="bg-theme-primary/10 border border-theme-primary/30 p-3.5 rounded-2xl flex items-center justify-between text-xs">
                                            <span className="font-bold text-theme-primary">{selectedItems.length} items selected</span>
                                            <button 
                                                onClick={() => setSelectedItems([])} 
                                                className="text-theme-muted hover:text-theme-text font-semibold hover:underline"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    )}

                                    {/* Insertion triggers */}
                                    <div className="flex flex-col gap-2.5 pt-2.5 border-t border-theme-border/40">
                                        <button
                                            type="button"
                                            onClick={() => handleBatchAction('insert')}
                                            className="w-full bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-extrabold py-3 px-4 rounded-xl shadow-theme-md transition flex items-center justify-center space-x-1.5"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span>Insert Into Content Excerpt</span>
                                        </button>
                                        
                                        <button
                                            type="button"
                                            onClick={() => handleBatchAction('featured')}
                                            className="w-full bg-theme-accent hover:bg-theme-main border border-theme-border text-theme-text text-xs font-extrabold py-3 px-4 rounded-xl shadow-theme-sm transition flex items-center justify-center space-x-1.5"
                                            disabled={selectedItems.length > 1}
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>Set as Featured Cover</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleBatchAction('gallery')}
                                            className="w-full bg-theme-accent hover:bg-theme-main border border-theme-border text-theme-text text-xs font-extrabold py-3 px-4 rounded-xl shadow-theme-sm transition flex items-center justify-center space-x-1.5"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                            </svg>
                                            <span>Add to Article Gallery</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-center">
                                    <p className="text-theme-muted italic text-xs">Select an asset from the media grid to view parameters.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
