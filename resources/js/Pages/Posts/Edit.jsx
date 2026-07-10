import React, { useState } from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import RichTextEditor from '@/Components/RichTextEditor';
import MediaLibraryModal from '@/Components/MediaLibraryModal';

export default function Edit({ auth, post, categories }) {
    const [isMediaOpen, setIsMediaOpen] = useState(false);
    const [mediaTarget, setMediaTarget] = useState('gallery'); // 'cover' | 'gallery' | 'content'
    const [editorInstance, setEditorInstance] = useState(null);
    const [retainedGallery, setRetainedGallery] = useState(post.gallery_images || []);
    const { asset_url } = usePage().props;

    const { data, setData, post: postRequest, processing, errors } = useForm({
        category_id: post.category_id,
        title: post.title,
        slug: post.slug || '',
        content: post.content,
        image: post.image || null,
        gallery_images: [],
        retained_gallery_images: JSON.stringify(post.gallery_images || []),
        is_published: post.is_published,
        _method: 'PATCH',
    });

    const openMedia = (target) => {
        setMediaTarget(target);
        setIsMediaOpen(true);
    };

    const handleRemoveGalleryImage = (imgPath) => {
        const updated = retainedGallery.filter(img => img !== imgPath);
        setRetainedGallery(updated);
        setData('retained_gallery_images', JSON.stringify(updated));
    };

    const submit = (e) => {
        e.preventDefault();
        postRequest(route('posts.update', post.id));
    };

    // Resolve a stored path to a displayable URL
    const resolveUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('https') || path.startsWith('blob:')) return path;
        const cleanPath = path.replace(/^\/?storage\//, '').replace(/^\//, '');
        return `${asset_url || '/storage'}/${cleanPath}`;
    };

    // ── Media Library callbacks ───────────────────────────────────────────────

    const handleInsertIntoContent = (items) => {
        if (!editorInstance) return;
        editorInstance.model.change(() => {
            items.forEach(item => {
                const viewFragment = editorInstance.data.processor.toView(
                    `<p><img src="${item.url}" alt="${item.name}" style="max-width:100%;border-radius:12px;margin:1rem 0;" /></p>`
                );
                const modelFragment = editorInstance.data.toModel(viewFragment);
                editorInstance.model.insertContent(modelFragment, editorInstance.model.document.selection);
            });
        });
    };

    const handleSetFeaturedImage = (item) => {
        setData('image', item.path);
    };

    const handleAddToGallery = (items) => {
        const newPaths = items.map(i => i.path);
        const updated = Array.from(new Set([...retainedGallery, ...newPaths]));
        setRetainedGallery(updated);
        setData('retained_gallery_images', JSON.stringify(updated));
    };

    // Route callbacks based on which button opened the library
    const onInsert   = mediaTarget === 'content' ? handleInsertIntoContent : () => {};
    const onFeatured = mediaTarget === 'cover'   ? handleSetFeaturedImage  : () => {};
    const onGallery  = mediaTarget === 'gallery' ? handleAddToGallery      : () => {};

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="font-extrabold text-3xl tracking-tight text-theme-text leading-tight">
                            Edit Article
                        </h2>
                        <p className="text-sm text-theme-muted mt-1">{post.title}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => openMedia('gallery')}
                        className="px-5 py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white font-extrabold text-sm rounded-xl shadow-theme-md transition flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>📷 Media Library</span>
                    </button>
                </div>
            }
        >
            <Head title="Edit Post" />

            <div className="py-8">
                {/* WordPress-style two-column layout */}
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit}>
                        <div className="flex gap-6 items-start">

                            {/* ── Main Content Column ── */}
                            <div className="flex-1 space-y-6">
                                {/* Title & Slug */}
                                <div className="bg-theme-card border border-theme-border/60 rounded-2xl p-6 space-y-4 shadow-theme-xs">
                                    <div>
                                        <InputLabel htmlFor="title" value="Article Title" className="text-sm font-bold text-theme-text mb-2" />
                                        <TextInput
                                            id="title"
                                            type="text"
                                            value={data.title}
                                            className="w-full rounded-xl border border-theme-border/60 bg-theme-main text-theme-text focus:border-theme-primary focus:ring-1 focus:ring-theme-primary p-3 text-sm focus:outline-none"
                                            onChange={(e) => setData('title', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.title} className="mt-1" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="slug" value="Custom SEO Slug" className="text-sm font-bold text-theme-text mb-2" />
                                        <div className="flex items-center rounded-xl border border-theme-border/60 bg-theme-main overflow-hidden focus-within:border-theme-primary focus-within:ring-1 focus-within:ring-theme-primary">
                                            <span className="px-3 py-3 text-sm text-theme-muted border-r border-theme-border/40 bg-theme-accent/30 select-none">/posts/</span>
                                            <input
                                                id="slug"
                                                type="text"
                                                value={data.slug}
                                                placeholder="auto-generated-from-title"
                                                className="flex-1 bg-transparent text-theme-text p-3 text-sm focus:outline-none"
                                                onChange={(e) => setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                                            />
                                        </div>
                                        <InputError message={errors.slug} className="mt-1" />
                                    </div>
                                </div>

                                {/* CKEditor Body */}
                                <div className="bg-theme-card border border-theme-border/60 rounded-2xl p-6 shadow-theme-xs">
                                    <div className="flex justify-between items-center mb-3">
                                        <InputLabel value="Article Content" className="text-sm font-bold text-theme-text" />
                                        <button
                                            type="button"
                                            onClick={() => openMedia('content')}
                                            className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add image from Media Library
                                        </button>
                                    </div>
                                    <RichTextEditor
                                        value={data.content}
                                        onChange={(html) => setData('content', html)}
                                        onInit={(editor) => setEditorInstance(editor)}
                                        placeholder="Write your article content here..."
                                    />
                                    <InputError message={errors.content} className="mt-2" />
                                </div>
                            </div>

                            {/* ── WordPress-style Right Sidebar ── */}
                            <div className="w-80 shrink-0 space-y-5">

                                {/* Publish Box */}
                                <div className="bg-theme-card border border-theme-border/60 rounded-2xl shadow-theme-xs overflow-hidden">
                                    <div className="px-5 py-3 bg-theme-accent/30 border-b border-theme-border/40">
                                        <h4 className="text-sm font-extrabold text-theme-text">Publish</h4>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div>
                                            <InputLabel htmlFor="category_id" value="Category" className="text-xs font-bold text-theme-text mb-1.5" />
                                            <select
                                                id="category_id"
                                                value={data.category_id}
                                                className="w-full rounded-xl border border-theme-border/60 bg-theme-main text-theme-text focus:border-theme-primary p-2.5 text-sm focus:outline-none"
                                                onChange={(e) => setData('category_id', e.target.value)}
                                                required
                                            >
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <InputError message={errors.category_id} className="mt-1" />
                                        </div>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                id="is_published"
                                                type="checkbox"
                                                checked={data.is_published}
                                                className="h-4 w-4 rounded border-theme-border/60 text-theme-primary focus:ring-theme-primary"
                                                onChange={(e) => setData('is_published', e.target.checked)}
                                            />
                                            <span className="text-sm font-semibold text-theme-text">Published (visible publicly)</span>
                                        </label>
                                        <div className="flex gap-3 pt-2 border-t border-theme-border/40">
                                            <Link
                                                href={route('dashboard')}
                                                className="flex-1 text-center px-4 py-2 text-sm font-bold text-theme-muted bg-theme-main/50 hover:bg-theme-main border border-theme-border rounded-xl transition"
                                            >
                                                Cancel
                                            </Link>
                                            <PrimaryButton
                                                disabled={processing}
                                                className="flex-1 justify-center bg-theme-primary hover:bg-theme-primary-hover text-white font-extrabold px-4 py-2 rounded-xl shadow-theme-sm transition text-sm"
                                            >
                                                {processing ? 'Saving…' : 'Update'}
                                            </PrimaryButton>
                                        </div>
                                    </div>
                                </div>

                                {/* Featured Image Box */}
                                <div className="bg-theme-card border border-theme-border/60 rounded-2xl shadow-theme-xs overflow-hidden">
                                    <div className="px-5 py-3 bg-theme-accent/30 border-b border-theme-border/40 flex justify-between items-center">
                                        <h4 className="text-sm font-extrabold text-theme-text">Featured Image</h4>
                                        {data.image && (
                                            <button type="button" onClick={() => setData('image', null)} className="text-xs text-red-400 hover:text-red-600 font-bold">Remove</button>
                                        )}
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {data.image ? (
                                            <div className="rounded-xl overflow-hidden border border-theme-border/40 aspect-video">
                                                <img
                                                    src={resolveUrl(typeof data.image === 'string' ? data.image : URL.createObjectURL(data.image))}
                                                    alt="Featured cover"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-video rounded-xl border-2 border-dashed border-theme-border/50 flex items-center justify-center text-theme-muted bg-theme-main/10">
                                                <div className="text-center space-y-1">
                                                    <svg className="w-8 h-8 mx-auto opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-xs">No image set</p>
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => openMedia('cover')}
                                            className="w-full text-xs font-bold text-theme-primary border border-theme-primary/30 hover:bg-theme-primary/10 py-2 px-3 rounded-xl transition"
                                        >
                                            {data.image ? '🔄 Change Featured Image' : '+ Set Featured Image'}
                                        </button>
                                        {/* Also allow direct file upload */}
                                        <label className="flex items-center gap-2 text-xs text-theme-muted hover:text-theme-text cursor-pointer transition">
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files[0] && setData('image', e.target.files[0])} />
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                            Or upload from computer
                                        </label>
                                    </div>
                                </div>

                                {/* Article Gallery Box */}
                                <div className="bg-theme-card border border-theme-border/60 rounded-2xl shadow-theme-xs overflow-hidden">
                                    <div className="px-5 py-3 bg-theme-accent/30 border-b border-theme-border/40 flex justify-between items-center">
                                        <h4 className="text-sm font-extrabold text-theme-text">
                                            Article Gallery
                                            {retainedGallery.length > 0 && (
                                                <span className="ml-2 text-xs font-semibold text-theme-muted">({retainedGallery.length})</span>
                                            )}
                                        </h4>
                                        {retainedGallery.length > 0 && (
                                            <button type="button" onClick={() => { setRetainedGallery([]); setData('retained_gallery_images', '[]'); }} className="text-xs text-red-400 hover:text-red-600 font-bold">Clear all</button>
                                        )}
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {retainedGallery.length > 0 ? (
                                            <div className="grid grid-cols-3 gap-2">
                                                {retainedGallery.map((img, i) => (
                                                    <div key={i} className="relative group rounded-lg overflow-hidden aspect-square border border-theme-border/40">
                                                        <img
                                                            src={resolveUrl(img)}
                                                            alt={`Gallery ${i + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveGalleryImage(img)}
                                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition rounded-lg"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-6 rounded-xl border-2 border-dashed border-theme-border/50 flex flex-col items-center justify-center text-theme-muted bg-theme-main/10 space-y-1">
                                                <svg className="w-7 h-7 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-xs">No gallery images yet</p>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => openMedia('gallery')}
                                            className="w-full text-xs font-bold text-theme-primary border border-theme-primary/30 hover:bg-theme-primary/10 py-2 px-3 rounded-xl transition"
                                        >
                                            + Add Images from Media Library
                                        </button>
                                        {/* Also allow direct multi-file upload */}
                                        <label className="flex items-center gap-2 text-xs text-theme-muted hover:text-theme-text cursor-pointer transition">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => {
                                                    const newFiles = Array.from(e.target.files);
                                                    setData('gallery_images', [...data.gallery_images, ...newFiles]);
                                                }}
                                            />
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                            Or upload from computer
                                        </label>
                                        {data.gallery_images.length > 0 && (
                                            <p className="text-xs text-theme-primary font-bold">{data.gallery_images.length} new file(s) queued for upload</p>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Media Library Modal */}
            <MediaLibraryModal
                isOpen={isMediaOpen}
                onClose={() => setIsMediaOpen(false)}
                onInsertIntoContent={onInsert}
                onSetFeaturedImage={onFeatured}
                onAddToGallery={onGallery}
            />
        </AuthenticatedLayout>
    );
}
