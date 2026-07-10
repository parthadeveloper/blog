import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PublicLayout from '@/Layouts/PublicLayout';

export default function Show({ auth, post }) {
    const Layout = auth.user ? AuthenticatedLayout : PublicLayout;
    const { settings, asset_url } = usePage().props;
    const theme = settings?.theme || 'theme-emerald';

    const resolveUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('https')) return path;
        const cleanPath = path.replace(/^\/?storage\//, '').replace(/^\//, '');
        return `${asset_url || '/storage'}/${cleanPath}`;
    };

    // Inertia form hook for adding comments
    const { data, setData, post: postComment, processing, errors, reset } = useForm({
        content: '',
        rating: 5,
    });

    const [hoverRating, setHoverRating] = useState(0);
    const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);

    const isInfinite = settings?.gallery_infinite_loop !== false;

    // Keyboard navigation controls for premium lightbox slider UX
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (activeLightboxIndex === null || !post.gallery_images || post.gallery_images.length === 0) return;
            if (e.key === 'ArrowRight') {
                if (isInfinite) {
                    setActiveLightboxIndex((prev) => (prev + 1) % post.gallery_images.length);
                } else if (activeLightboxIndex < post.gallery_images.length - 1) {
                    setActiveLightboxIndex((prev) => prev + 1);
                }
            } else if (e.key === 'ArrowLeft') {
                if (isInfinite) {
                    setActiveLightboxIndex((prev) => (prev - 1 + post.gallery_images.length) % post.gallery_images.length);
                } else if (activeLightboxIndex > 0) {
                    setActiveLightboxIndex((prev) => prev - 1);
                }
            } else if (e.key === 'Escape') {
                setActiveLightboxIndex(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeLightboxIndex, post.gallery_images, isInfinite]);

    const handleSubmit = (e) => {
        e.preventDefault();
        postComment(route('comments.store', post.id), {
            onSuccess: () => reset('content', 'rating'),
        });
    };

    // Form hook for deleting comments
    const { delete: destroyComment } = useForm();
    const handleDeleteComment = (commentId) => {
        if (confirm('Are you sure you want to delete this comment?')) {
            destroyComment(route('comments.destroy', commentId));
        }
    };

    return (
        <Layout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <span className="bg-theme-accent text-theme-text-accent text-xxs font-extrabold px-3 py-1.5 rounded-lg border border-theme-primary/10 tracking-wider uppercase shadow-theme-xs">
                            {post.category.name}
                        </span>
                        <h2 className="font-extrabold text-3xl tracking-tight text-theme-text leading-tight mt-2.5">{post.title}</h2>
                    </div>
                    <Link 
                        href={route('posts.index')}
                        className="text-theme-primary hover:text-theme-primary-hover font-bold inline-flex items-center text-sm gap-1.5 transition-colors duration-150"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Articles
                    </Link>
                </div>
            }
        >
            <Head title={post.title} />

            <div className={`${theme} py-4 animate-fade-in font-sans space-y-8`}>
                {/* Main Post Card */}
                <div className="bg-theme-card overflow-hidden shadow-theme-sm rounded-2xl border border-theme-border/60 transition-all duration-300">
                    {post.image && (
                        <div className="w-full h-[420px] overflow-hidden">
                            <img 
                                src={resolveUrl(post.image)} 
                                alt={post.title} 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="p-8 md:p-10">
                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-theme-muted mb-6 font-semibold">
                            <span>Published on {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            <span className="opacity-40">•</span>
                            <span>Written by {post.user.name}</span>
                            
                            {post.average_rating && (
                                <>
                                    <span className="opacity-40">•</span>
                                    <div className="flex items-center text-amber-400">
                                        <svg className="w-4 h-4 fill-current mr-1.5" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="font-extrabold text-sm text-theme-text">{parseFloat(post.average_rating).toFixed(1)}</span>
                                        <span className="text-theme-muted ml-1.5">({post.comments_count} {post.comments_count === 1 ? 'review' : 'reviews'})</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Article Content */}
                        <div 
                            className="prose max-w-none text-theme-text leading-relaxed text-base md:text-lg ck-content"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Dynamic Post Gallery */}
                        {post.gallery_images && post.gallery_images.length > 0 && (
                            <div className="mt-12 border-t border-theme-border/50 pt-8">
                                <h4 className="text-xl font-extrabold text-theme-text mb-4">Article Gallery</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {post.gallery_images.map((img, i) => (
                                        <button 
                                            key={i} 
                                            type="button"
                                            onClick={() => setActiveLightboxIndex(i)}
                                            className="block rounded-2xl overflow-hidden border border-theme-border/60 hover:scale-[1.03] hover:border-theme-primary transition duration-300 aspect-[4/3] shadow-theme-sm text-left cursor-zoom-in group"
                                        >
                                            <img 
                                                src={resolveUrl(img)} 
                                                alt={`Gallery ${i + 1}`} 
                                                className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-108" 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Gorgeous Premium Lightbox Modal */}
                        {activeLightboxIndex !== null && post.gallery_images && post.gallery_images[activeLightboxIndex] && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-95 backdrop-blur-xl animate-fade-in text-white select-none">
                                {/* Backdrop dismiss */}
                                <div className="absolute inset-0 cursor-zoom-out" onClick={() => setActiveLightboxIndex(null)} />

                                {/* Top Stats */}
                                <div className="absolute top-6 left-6 flex items-center gap-4 z-10 pointer-events-none">
                                    <span className="pointer-events-auto text-xs sm:text-sm font-extrabold bg-neutral-900/80 px-4 py-2 rounded-xl backdrop-blur-md border border-neutral-700/50">
                                        📷 Image {activeLightboxIndex + 1} of {post.gallery_images.length}
                                    </span>
                                </div>

                                {/* Close Button */}
                                <button
                                    onClick={() => setActiveLightboxIndex(null)}
                                    className="absolute top-6 right-6 text-white hover:text-red-400 bg-neutral-900/80 hover:bg-neutral-800 p-3 rounded-full border border-neutral-700/50 transition duration-150 shadow-2xl z-30 pointer-events-auto flex items-center justify-center"
                                    title="Close Lightbox"
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {/* Prev Button - Centered Vertically at Left Screen Margin */}
                                {(isInfinite || activeLightboxIndex > 0) && (
                                    <button
                                        onClick={() => setActiveLightboxIndex(isInfinite ? (activeLightboxIndex - 1 + post.gallery_images.length) % post.gallery_images.length : activeLightboxIndex - 1)}
                                        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white hover:text-theme-primary bg-neutral-800 border-neutral-700 p-4 sm:p-5 rounded-full transition duration-150 shadow-2xl z-30 pointer-events-auto flex items-center justify-center hover:scale-105 active:scale-95 group"
                                        title="Previous Image (Left Arrow Key)"
                                    >
                                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:text-theme-primary transition duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                )}

                                {/* Staged Image - Direct Viewport Sized to Avoid Height Collapse */}
                                <div className="relative max-w-[80vw] max-h-[80vh] flex items-center justify-center z-10 pointer-events-none">
                                    <img
                                        src={resolveUrl(post.gallery_images[activeLightboxIndex])}
                                        alt={`Gallery image ${activeLightboxIndex + 1}`}
                                        className="w-[80vw] h-[80vh] max-w-[80vw] max-h-[80vh] rounded-3xl object-contain shadow-2xl border border-white/15 animate-scale-up duration-200 select-none pointer-events-auto"
                                    />
                                </div>

                                {/* Next Button - Centered Vertically at Right Screen Margin */}
                                {(isInfinite || activeLightboxIndex < post.gallery_images.length - 1) && (
                                    <button
                                        onClick={() => setActiveLightboxIndex(isInfinite ? (activeLightboxIndex + 1) % post.gallery_images.length : activeLightboxIndex + 1)}
                                        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white hover:text-theme-primary bg-neutral-800 border-neutral-700 p-4 sm:p-5 rounded-full transition duration-150 shadow-2xl z-30 pointer-events-auto flex items-center justify-center hover:scale-105 active:scale-95 group"
                                        title="Next Image (Right Arrow Key)"
                                    >
                                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:text-theme-primary transition duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional typography styles for CKEditor content rendering */}
                <style dangerouslySetInnerHTML={{ __html: `
                    .ck-content h2 { font-size: 1.75rem; font-weight: 800; margin-top: 1.75rem; margin-bottom: 0.75rem; color: var(--text-main); }
                    .ck-content h3 { font-size: 1.5rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; color: var(--text-main); }
                    .ck-content h4 { font-size: 1.25rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; color: var(--text-main); }
                    .ck-content p { margin-bottom: 1.25rem; line-height: 1.8; color: var(--text-main); }
                    .ck-content ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-bottom: 1.25rem !important; }
                    .ck-content ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-bottom: 1.25rem !important; }
                    .ck-content li { margin-bottom: 0.5rem !important; }
                    .ck-content blockquote {
                        border-left: 4px solid var(--color-primary);
                        padding: 0.5rem 1rem;
                        background: rgba(var(--text-main), 0.05);
                        margin: 1.5rem 0;
                        font-style: italic;
                    }
                `}} />

                {/* Comments & Reviews Segment */}
                <div className="bg-theme-card shadow-theme-sm rounded-2xl border border-theme-border/60 p-8 md:p-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-extrabold tracking-tight text-theme-text">Reviews & Discussion</h3>
                            <p className="text-sm text-theme-muted mt-0.5">Hear from the LaraBlog community and read helpful commentary.</p>
                        </div>
                        <span className="bg-theme-accent text-theme-text-accent text-sm font-extrabold px-3.5 py-1.5 rounded-full border border-theme-primary/10">
                            {post.comments_count || 0} reviews
                        </span>
                    </div>

                    {/* Interactive Form */}
                    {auth.user ? (
                        <form onSubmit={handleSubmit} className="bg-theme-main/15 p-6 md:p-8 rounded-2xl border border-theme-border/60 space-y-6">
                            <div>
                                <h4 className="text-lg font-extrabold text-theme-text">Leave a Rating & Comment</h4>
                                <p className="text-xs text-theme-muted mt-0.5">Your review helps improve community quality.</p>
                            </div>
                            
                            {/* Star select input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-theme-text">Rating Score</label>
                                <div className="flex items-center space-x-1.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setData('rating', star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="focus:outline-none transition-transform duration-100 hover:scale-110"
                                        >
                                            <svg
                                                className={`w-8 h-8 ${
                                                    star <= (hoverRating || data.rating)
                                                        ? 'text-amber-400 fill-current'
                                                        : 'text-theme-border'
                                                }`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </button>
                                    ))}
                                    <span className="text-sm text-theme-muted font-bold ml-2.5">
                                        {data.rating} out of 5 stars
                                    </span>
                                </div>
                            </div>

                            {/* Comment content */}
                            <div className="space-y-2">
                                <label htmlFor="content" className="block text-sm font-bold text-theme-text">
                                    Comment Message
                                </label>
                                <textarea
                                    id="content"
                                    rows="4"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Write a thoughtful comment..."
                                    className="w-full rounded-xl border-theme-border/60 bg-theme-card text-theme-text focus:border-theme-primary focus:ring-1 focus:ring-theme-primary focus:outline-none transition duration-150 p-4"
                                    required
                                ></textarea>
                                {errors.content && (
                                    <p className="text-red-500 text-xs mt-1">{errors.content}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-theme-primary hover:bg-theme-primary-hover text-white font-bold py-2.5 px-6 rounded-xl transition duration-150 shadow-theme-md disabled:opacity-50 text-sm border border-theme-primary/10"
                            >
                                Submit Review
                            </button>
                        </form>
                    ) : (
                        <div className="p-8 bg-gradient-to-r from-theme-primary/10 to-theme-primary/5 border border-theme-primary/20 rounded-2xl text-center space-y-4 shadow-theme-xs">
                            <div>
                                <h4 className="text-lg font-extrabold text-theme-text">Join the Discussion</h4>
                                <p className="text-theme-muted text-sm mt-0.5">Sign in to rate this post and leave your feedback.</p>
                            </div>
                            <div className="flex justify-center gap-3">
                                <Link
                                    href={route('login')}
                                    className="bg-theme-primary hover:bg-theme-primary-hover text-white text-sm font-bold py-2.5 px-6 rounded-xl shadow-theme-sm hover:shadow-theme-md transition duration-150 border border-theme-primary/10"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="bg-theme-card hover:bg-theme-main/50 text-theme-muted hover:text-theme-text text-sm border border-theme-border/60 font-bold py-2.5 px-6 rounded-xl shadow-theme-sm transition duration-150"
                                >
                                    Create Account
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-4">
                        {post.comments && post.comments.length > 0 ? (
                            post.comments.map((comment) => (
                                <div key={comment.id} className="bg-theme-card p-6 rounded-2xl border border-theme-border/60 shadow-theme-xs transition-all hover:shadow-sm hover:border-theme-primary/25">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h5 className="font-extrabold text-theme-text text-base">{comment.user.name}</h5>
                                            {comment.rating && (
                                                <div className="flex text-amber-400 mt-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <svg 
                                                            key={star} 
                                                            className={`w-3.5 h-3.5 ${star <= comment.rating ? 'fill-current' : 'text-theme-border'}`} 
                                                            fill="currentColor" 
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xs text-theme-muted font-semibold">
                                                {new Date(comment.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                            {(auth.user && (auth.user.id === comment.user_id || auth.user.role === 'admin')) && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="text-red-500 hover:text-red-700 text-xs font-extrabold border border-red-500/25 hover:bg-red-500/10 px-2.5 py-1 rounded-xl transition duration-150"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="mt-4 text-theme-text text-sm leading-relaxed whitespace-pre-wrap">
                                        {comment.content}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-theme-main/10 rounded-2xl border border-dashed border-theme-border/60">
                                <p className="text-theme-muted italic text-sm">No comments or ratings yet. Be the first to share your thoughts!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
