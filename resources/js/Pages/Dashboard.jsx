import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Dashboard({ auth, posts, categories = [], allComments = { data: [] }, myComments = { data: [] } }) {
    const isAdmin = auth.user.role === 'admin';
    const activeTheme = usePage().props.settings?.theme || 'theme-emerald';
    
    // Set default active tab based on role and URL query param
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const tabParam = urlParams.get('tab');
            if (tabParam) {
                const validAdminTabs = ['posts', 'categories', 'comments', 'settings'];
                const validUserTabs = ['my-comments', 'profile-info'];
                if (isAdmin && validAdminTabs.includes(tabParam)) return tabParam;
                if (!isAdmin && validUserTabs.includes(tabParam)) return tabParam;
            }
        }
        return isAdmin ? 'posts' : 'my-comments';
    });

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tabName);
            window.history.pushState({}, '', url.toString());
        }
    };

    const [selectedTheme, setSelectedTheme] = useState(activeTheme);

    // Custom Professional Delete Confirmation Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'post'|'comment'|'category', id: number, label: string }

    const openDeleteModal = (type, id, label) => {
        setDeleteTarget({ type, id, label });
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setDeleteTarget(null);
    };

    // Category CRUD Form Hooks
    const { data: categoryData, setData: setCategoryData, post: postCategory, delete: deleteCategory, processing: processingCategory, reset: resetCategory, errors: categoryErrors } = useForm({
        name: '',
    });

    const [editingCategory, setEditingCategory] = useState(null); // category object being edited, or null
    const [categoryModalOpen, setCategoryModalOpen] = useState(false); // add/edit category modal toggle

    const openCategoryModal = (cat = null) => {
        setEditingCategory(cat);
        setCategoryData('name', cat ? cat.name : '');
        setCategoryModalOpen(true);
    };

    const closeCategoryModal = () => {
        setCategoryModalOpen(false);
        setEditingCategory(null);
        resetCategory();
    };

    const handleCategorySubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            postCategory(route('categories.update', editingCategory.id), {
                onSuccess: () => closeCategoryModal(),
            });
        } else {
            postCategory(route('categories.store'), {
                onSuccess: () => closeCategoryModal(),
            });
        }
    };

    // Post Delete Hook
    const { delete: destroyPost } = useForm();
    const handleDeletePost = (id) => {
        openDeleteModal('post', id, 'this blog post');
    };

    // Comment Actions Hook
    const { delete: destroyComment, patch: patchComment } = useForm();
    
    const handleDeleteComment = (id) => {
        openDeleteModal('comment', id, 'this comment');
    };

    const handleToggleCommentApproval = (id) => {
        patchComment(route('comments.toggle-approval', id));
    };

    const settings = usePage().props.settings || {};

    // General & Theme Settings Form Hook
    const { data: generalData, setData: setGeneralData, post: postGeneral, processing: processingGeneral, errors: generalErrors } = useForm({
        site_name: settings.name || 'LaraBlog',
        posts_per_page: settings.posts_per_page || 10,
        theme: selectedTheme,
        homepage_title: settings.homepage_title || 'Latest Publications',
        homepage_subtitle: settings.homepage_subtitle || 'Explore insightful articles, tutorials, and travel diaries curated by the community.',
        logo: null,
        favicon: null,
        gallery_infinite_loop: settings.gallery_infinite_loop !== undefined ? settings.gallery_infinite_loop : true,
        dash_posts_per_page: settings.dash_posts_per_page || 10,
        dash_categories_per_page: settings.dash_categories_per_page || 10,
        dash_comments_per_page: settings.dash_comments_per_page || 10,
        site_footer: settings.site_footer || '© 2026 LaraBlog. Built with Laravel & React.',
        email_verification_enabled: settings.email_verification_enabled !== undefined ? settings.email_verification_enabled : false,
    });

    const handleGeneralSubmit = (e) => {
        e.preventDefault();
        postGeneral(route('settings.general'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;

        if (deleteTarget.type === 'post') {
            destroyPost(route('posts.destroy', deleteTarget.id), {
                onSuccess: () => closeDeleteModal(),
            });
        } else if (deleteTarget.type === 'comment') {
            destroyComment(route('comments.destroy', deleteTarget.id), {
                onSuccess: () => closeDeleteModal(),
            });
        } else if (deleteTarget.type === 'category') {
            deleteCategory(route('categories.destroy', deleteTarget.id), {
                onSuccess: () => closeDeleteModal(),
            });
        }
    };

    const themesList = [
        { 
            name: 'Classic Editorial (Light)', 
            value: 'theme-emerald', 
            desc: 'Stark white background with crisp slate headings and borders. Highly optimized for reading clarity.', 
            palette: ['#ffffff', '#fafafa', '#0f172a', '#64748b', '#e2e8f0'] 
        },
        { 
            name: 'Nordic Slate (Corporate Dark)', 
            value: 'theme-dark-slate', 
            desc: 'Modern professional deep slate backdrop paired with soft slate-blue panels and cool grey typography.', 
            palette: ['#0f172a', '#1e293b', '#60a5fa', '#94a3b8', '#334155'] 
        },
        { 
            name: 'Deep Ocean Blue (Enterprise Dark)', 
            value: 'theme-cyberpunk', 
            desc: 'Enterprise corporate deep blue-navy backdrop with steel borders and soft cyan active text.', 
            palette: ['#0a0f1d', '#11182b', '#0ea5e9', '#94a3b8', '#1e293b'] 
        },
        { 
            name: 'Warm Editorial (Minimal Cream)', 
            value: 'theme-retro-amber', 
            desc: 'Cozy, sophisticated warm paper cream background with crisp neutral charcoal typography.', 
            palette: ['#fbfaf7', '#ffffff', '#141414', '#6e6e6e', '#eceae4'] 
        },
        { 
            name: 'Slate Tech (Minimal Light)', 
            value: 'theme-nordic-snow', 
            desc: 'Fresh slate-50 light backdrop combined with elegant royal blue highlight links and grey accents.', 
            palette: ['#f8fafc', '#ffffff', '#2563eb', '#475569', '#e2e8f0'] 
        },
        { 
            name: 'Royal Blue Corporate (Light)', 
            value: 'theme-corp-indigo', 
            desc: 'Classic enterprise news layout featuring pure white pages and strong royal blue highlights.', 
            palette: ['#ffffff', '#fafafa', '#1d4ed8', '#6b7280', '#e5e7eb'] 
        },
        { 
            name: 'Modern Obsidian (Sleek Dark)', 
            value: 'theme-emerald-pine', 
            desc: 'High-contrast clean obsidian black backdrop styled with sleek neutral grey panels and fresh tech-green highlights.', 
            palette: ['#18181b', '#27272a', '#22c55e', '#a1a1aa', '#3f3f46'] 
        },
        { 
            name: 'Teal Professional (Light)', 
            value: 'theme-teal-minimal', 
            desc: 'Pristine light workspace styled with sophisticated corporate deep teal highlights and neutral grey panels.', 
            palette: ['#fdfdfd', '#ffffff', '#0d9488', '#64748b', '#e4e9e8'] 
        },
        { 
            name: 'Coal Carbon (Corporate Dark)', 
            value: 'theme-deep-plum', 
            desc: 'Premium sleek carbon background with soft grey card accents and high-visibility professional teal text.', 
            palette: ['#0b0f19', '#121826', '#2dd4bf', '#9ca3af', '#1f2937'] 
        },
        { 
            name: 'Minimalist Ink (Pure Light)', 
            value: 'theme-warm-terracotta', 
            desc: 'Stark white layout with high-contrast sharp black borders and pure ink black details.', 
            palette: ['#ffffff', '#ffffff', '#000000', '#737373', '#e5e5e5'] 
        },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="font-extrabold text-3xl tracking-tight text-theme-text leading-tight">
                            {isAdmin ? 'Admin Control Center' : 'My Personal Dashboard'}
                        </h2>
                        <p className="text-sm text-theme-muted mt-1">
                            Welcome back, <span className="font-semibold text-theme-text">{auth.user.name}</span>
                        </p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase border shadow-theme-xs ${
                        isAdmin 
                            ? 'bg-theme-accent/60 text-theme-text-accent border-theme-primary/30' 
                            : 'bg-theme-accent/30 text-theme-text-accent border-theme-border'
                    }`}>
                        {isAdmin ? '🛡️ Administrator' : '👤 Reader Account'}
                    </span>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-8 animate-fade-in">
                
                {/* Navigation Tabs */}
                <div className="flex border-b border-theme-border/60 mb-6 space-x-6 overflow-x-auto scrollbar-none">
                    {isAdmin ? (
                        <>
                            <button
                                onClick={() => handleTabChange('posts')}
                                className={`pb-3.5 font-bold text-sm tracking-tight transition-colors border-b-2 px-1 focus:outline-none whitespace-nowrap ${
                                    activeTab === 'posts'
                                        ? 'border-theme-primary text-theme-primary'
                                        : 'border-transparent text-theme-muted hover:text-theme-text'
                                }`}
                            >
                                Blog Articles ({posts.total || 0})
                            </button>
                            <button
                                onClick={() => handleTabChange('categories')}
                                className={`pb-3.5 font-bold text-sm tracking-tight transition-colors border-b-2 px-1 focus:outline-none whitespace-nowrap ${
                                    activeTab === 'categories'
                                        ? 'border-theme-primary text-theme-primary'
                                        : 'border-transparent text-theme-muted hover:text-theme-text'
                                }`}
                            >
                                Categories ({categories.total || 0})
                            </button>
                            <button
                                onClick={() => handleTabChange('comments')}
                                className={`pb-3.5 font-bold text-sm tracking-tight transition-colors border-b-2 px-1 focus:outline-none whitespace-nowrap ${
                                    activeTab === 'comments'
                                        ? 'border-theme-primary text-theme-primary'
                                        : 'border-transparent text-theme-muted hover:text-theme-text'
                                }`}
                            >
                                Comment Moderation ({allComments.total || 0})
                            </button>
                            <button
                                onClick={() => handleTabChange('settings')}
                                className={`pb-3.5 font-bold text-sm tracking-tight transition-colors border-b-2 px-1 focus:outline-none whitespace-nowrap ${
                                    activeTab === 'settings'
                                        ? 'border-theme-primary text-theme-primary'
                                        : 'border-transparent text-theme-muted hover:text-theme-text'
                                }`}
                            >
                                General Site Settings
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => handleTabChange('my-comments')}
                                className={`pb-3.5 font-bold text-sm tracking-tight transition-colors border-b-2 px-1 focus:outline-none whitespace-nowrap ${
                                    activeTab === 'my-comments'
                                        ? 'border-theme-primary text-theme-primary'
                                        : 'border-transparent text-theme-muted hover:text-theme-text'
                                }`}
                            >
                                My Reviews ({myComments.data?.length || 0})
                            </button>
                            <button
                                onClick={() => handleTabChange('profile-info')}
                                className={`pb-3.5 font-bold text-sm tracking-tight transition-colors border-b-2 px-1 focus:outline-none whitespace-nowrap ${
                                    activeTab === 'profile-info'
                                        ? 'border-theme-primary text-theme-primary'
                                        : 'border-transparent text-theme-muted hover:text-theme-text'
                                }`}
                            >
                                Account Info
                            </button>
                        </>
                    )}
                </div>

                {/* Content Segments */}
                <div className="bg-theme-card rounded-2xl border border-theme-border/60 overflow-hidden shadow-theme-md transition-all duration-300">
                    <div className="p-6 md:p-8">
                        
                        {/* --- TAB: ADMIN POSTS --- */}
                        {activeTab === 'posts' && isAdmin && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h4 className="text-xl font-extrabold tracking-tight text-theme-text">Manage Blog Articles</h4>
                                        <p className="text-sm text-theme-muted mt-0.5">Compose, update, and manage all published or drafted posts.</p>
                                    </div>
                                    <Link
                                        href={route('posts.create')}
                                        className="bg-theme-primary hover:bg-theme-primary-hover text-white font-bold py-2.5 px-5 rounded-xl shadow-theme-sm hover:shadow-theme-md transition-all duration-200 flex items-center text-sm gap-2 whitespace-nowrap"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path>
                                        </svg>
                                        Create New Post
                                    </Link>
                                </div>

                                {posts.data.length === 0 ? (
                                    <div className="text-center py-16 bg-theme-main/20 border border-dashed border-theme-border rounded-2xl">
                                        <p className="text-theme-muted mb-4 font-semibold">No blog posts found in the system.</p>
                                        <Link href={route('posts.create')} className="text-theme-primary font-bold hover:underline">Write the first post</Link>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-theme-border/60 shadow-theme-xs">
                                        <table className="min-w-full divide-y divide-theme-border/60">
                                            <thead className="bg-theme-main/30">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-theme-muted uppercase tracking-wider">Title</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-theme-muted uppercase tracking-wider">Category</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-theme-muted uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-theme-muted uppercase tracking-wider">Rating</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-theme-muted uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-4 text-right text-xs font-bold text-theme-muted uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-theme-border/50">
                                                {posts.data.map((post) => (
                                                    <tr key={post.id} className="hover:bg-theme-main/10 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-theme-text truncate max-w-xs">{post.title}</div>
                                                            <div className="text-xs text-theme-muted mt-0.5">By {post.user?.name || 'Unknown'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-theme-accent/50 text-theme-text-accent border border-theme-primary/10">
                                                                {post.category?.name}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                                                                post.is_published 
                                                                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                            }`}>
                                                                {post.is_published ? 'Published' : 'Draft'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text">
                                                            {post.comments_avg_rating ? (
                                                                <div className="flex items-center text-amber-400">
                                                                    <svg className="w-4 h-4 fill-current mr-1.5" viewBox="0 0 20 20">
                                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                    </svg>
                                                                    <span className="font-bold">{parseFloat(post.comments_avg_rating).toFixed(1)}</span>
                                                                    <span className="text-xs text-theme-muted ml-1.5">({post.comments_count})</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-theme-muted text-xs italic">Unrated</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-muted">
                                                            {new Date(post.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold space-x-4">
                                                            <Link href={route('posts.show', post.slug)} className="text-theme-muted hover:text-theme-primary transition-colors">View</Link>
                                                            <Link href={route('posts.edit', post.id)} className="text-theme-primary hover:text-theme-primary-hover transition-colors">Edit</Link>
                                                            <button 
                                                                onClick={() => handleDeletePost(post.id)}
                                                                className="text-red-500 hover:text-red-600 transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Pagination */}
                                {posts.links && posts.links.length > 3 && (
                                    <div className="mt-6 flex justify-center">
                                        {posts.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-3.5 py-2 mx-1 rounded-xl border text-sm transition-all duration-150 ${
                                                    link.active 
                                                        ? 'bg-theme-primary text-white border-theme-primary shadow-theme-xs' 
                                                        : 'bg-theme-card text-theme-muted border-theme-border/60 hover:bg-theme-main/50 hover:text-theme-text'
                                                } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- TAB: ADMIN CATEGORIES --- */}
                        {activeTab === 'categories' && isAdmin && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-theme-border/60 pb-5">
                                    <div>
                                        <h4 className="text-2xl font-extrabold tracking-tight text-theme-text">Blog Taxonomy & Categories</h4>
                                        <p className="text-sm text-theme-muted mt-0.5">Explore active article collections across your LaraBlog platform.</p>
                                    </div>
                                    <button
                                        onClick={() => openCategoryModal(null)}
                                        className="bg-theme-primary hover:bg-theme-primary-hover text-white font-bold py-2.5 px-5 rounded-xl shadow-theme-md hover:shadow-theme-lg transition-all duration-200 text-sm flex items-center gap-2 border border-theme-primary/10"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add New Category
                                    </button>
                                </div>

                                {!categories.data || categories.data.length === 0 ? (
                                    <p className="text-theme-muted italic text-center py-12 bg-theme-main/10 rounded-2xl border border-dashed border-theme-border">No categories exist yet.</p>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                            {categories.data.map((cat) => (
                                                <div key={cat.id} className="p-6 rounded-2xl border border-theme-border bg-theme-card hover:border-theme-primary/40 transition-all duration-300 shadow-theme-xs flex flex-col justify-between group relative overflow-hidden">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <span className="font-extrabold text-theme-text text-lg group-hover:text-theme-primary transition-colors block">{cat.name}</span>
                                                            <span className="text-xs text-theme-muted block mt-1">slug: <code className="font-mono bg-theme-main/45 px-1.5 py-0.5 rounded text-theme-text">{cat.slug}</code></span>
                                                        </div>
                                                        <span className="bg-theme-accent text-theme-text-accent text-xs font-extrabold px-3 py-1 rounded-full border border-theme-primary/10 shadow-theme-xxs">
                                                            {cat.posts_count} {cat.posts_count === 1 ? 'post' : 'posts'}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-end gap-3 pt-3 border-t border-theme-border/50 mt-2">
                                                        <button 
                                                            onClick={() => openCategoryModal(cat)}
                                                            className="text-theme-primary hover:text-theme-primary-hover text-xs font-extrabold flex items-center gap-1 bg-theme-primary/5 hover:bg-theme-primary/10 px-2.5 py-1.5 rounded-lg border border-theme-primary/10 transition-all duration-150"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => openDeleteModal('category', cat.id, `the category "${cat.name}"`)}
                                                            className="text-red-500 hover:text-red-600 text-xs font-extrabold flex items-center gap-1 bg-red-500/5 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-red-500/10 transition-all duration-150"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Categories Pagination */}
                                        {categories.links && categories.links.length > 3 && (
                                            <div className="mt-8 flex justify-center">
                                                {categories.links.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                        className={`px-3.5 py-2 mx-1 rounded-xl border text-sm transition-all duration-150 ${
                                                            link.active 
                                                                ? 'bg-theme-primary text-white border-theme-primary shadow-theme-xs' 
                                                                : 'bg-theme-card text-theme-muted border-theme-border/60 hover:bg-theme-main/50 hover:text-theme-text'
                                                        } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* --- TAB: ADMIN COMMENT MODERATION --- */}
                        {activeTab === 'comments' && isAdmin && (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xl font-extrabold tracking-tight text-theme-text">Comment Moderation Console</h4>
                                    <p className="text-sm text-theme-muted mt-0.5">Publish or reject reader ratings and text comments.</p>
                                </div>

                                {allComments.data.length === 0 ? (
                                    <p className="text-theme-muted italic text-center py-10 bg-theme-main/10 rounded-2xl border border-dashed border-theme-border">No comments exist in the system yet.</p>
                                ) : (
                                    <div className="space-y-6">
                                        {allComments.data.map((comment) => (
                                            <div key={comment.id} className="p-6 rounded-2xl border border-theme-border/60 bg-theme-card shadow-theme-xs hover:shadow-theme-sm transition-all duration-200">
                                                <div className="flex flex-wrap justify-between items-start gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-extrabold text-theme-text">{comment.user?.name || 'Unknown User'}</span>
                                                            <span className="text-xs text-theme-muted">reviewed</span>
                                                            <Link 
                                                                href={route('posts.show', comment.post?.slug || '#')} 
                                                                className="text-xs font-bold text-theme-primary hover:underline max-w-xs truncate"
                                                            >
                                                                {comment.post?.title || 'Unknown Post'}
                                                            </Link>
                                                        </div>
                                                        {comment.rating && (
                                                            <div className="flex text-amber-400 mt-1.5">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <svg key={star} className={`w-3.5 h-3.5 ${star <= comment.rating ? 'fill-current' : 'text-theme-border'}`} fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                    </svg>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center space-x-3 text-sm">
                                                        <button
                                                            onClick={() => handleToggleCommentApproval(comment.id)}
                                                            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all duration-150 border ${
                                                                comment.is_approved
                                                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/25 hover:bg-amber-500/20'
                                                                    : 'bg-green-500/10 text-green-500 border-green-500/25 hover:bg-green-500/20'
                                                            }`}
                                                        >
                                                            {comment.is_approved ? '🚫 Hide Review' : '✔️ Publish Review'}
                                                        </button>
                                                        
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className="text-red-500 hover:text-red-700 text-xs font-extrabold"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="mt-4 text-sm text-theme-text bg-theme-main/15 p-4 rounded-xl border border-theme-border/30 whitespace-pre-wrap leading-relaxed">
                                                    {comment.content}
                                                </p>

                                                <div className="flex justify-between items-center mt-4 text-xs text-theme-muted">
                                                    <span>Submitted: {new Date(comment.created_at).toLocaleString()}</span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xxs font-extrabold uppercase border ${
                                                        comment.is_approved 
                                                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    }`}>
                                                        {comment.is_approved ? 'Active / Visible' : 'Pending Moderation'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                {allComments.links && allComments.links.length > 3 && (
                                    <div className="mt-6 flex justify-center">
                                        {allComments.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-3.5 py-2 mx-1 rounded-xl border text-sm transition-all duration-150 ${
                                                    link.active 
                                                        ? 'bg-theme-primary text-white border-theme-primary shadow-theme-xs' 
                                                        : 'bg-theme-card text-theme-muted border-theme-border/60 hover:bg-theme-main/50 hover:text-theme-text'
                                                } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- TAB: ADMIN THEME SETTINGS --- */}
                        {activeTab === 'settings' && isAdmin && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <h4 className="text-2xl font-extrabold tracking-tight text-theme-text">General Site Settings</h4>
                                    <p className="text-sm text-theme-muted mt-0.5">Customize your brand identity, navigation elements, asset representations, and pagination rules dynamically.</p>
                                </div>

                                <form onSubmit={handleGeneralSubmit} className="space-y-8">
                                    {/* Dynamic Branding & Pagination Settings Panel */}
                                    <div className="bg-theme-card p-6 md:p-8 rounded-2xl border border-theme-border/60 shadow-theme-xs space-y-6">
                                        <h5 className="text-lg font-extrabold text-theme-text border-b border-theme-border/60 pb-3">Branding & Pagination Settings</h5>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-theme-text mb-2">Website Name</label>
                                                <input 
                                                    type="text"
                                                    value={generalData.site_name}
                                                    onChange={(e) => setGeneralData('site_name', e.target.value)}
                                                    className="w-full rounded-xl border border-theme-border/60 bg-theme-main text-theme-text focus:border-theme-primary focus:ring-1 focus:ring-theme-primary p-3 text-sm focus:outline-none transition duration-150"
                                                    placeholder="Enter site name"
                                                    required
                                                />
                                                {generalErrors.site_name && <p className="text-red-500 text-xs mt-1">{generalErrors.site_name}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-theme-text mb-2">📄 Blog Index — Articles Per Page</label>
                                                <select
                                                    value={generalData.posts_per_page}
                                                    onChange={(e) => setGeneralData('posts_per_page', e.target.value)}
                                                    className="w-full rounded-xl border border-theme-border/60 bg-theme-main text-theme-text focus:border-theme-primary focus:ring-1 focus:ring-theme-primary p-3 text-sm focus:outline-none transition duration-150"
                                                >
                                                    {[2, 5, 10, 20, 50].map((num) => (
                                                        <option key={num} value={num}>{num} articles per page</option>
                                                    ))}
                                                </select>
                                                {generalErrors.posts_per_page && <p className="text-red-500 text-xs mt-1">{generalErrors.posts_per_page}</p>}
                                            </div>
                                        </div>

                                        {/* Dashboard Per-Page Controls */}
                                        <div className="border-t border-theme-border/60 pt-5">
                                            <h6 className="text-sm font-extrabold text-theme-text mb-4">🗂️ Admin Dashboard — Items Per Page</h6>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                <div className="bg-theme-main/50 border border-theme-border/50 rounded-xl p-4 space-y-2">
                                                    <label className="block text-xs font-extrabold text-theme-text uppercase tracking-wider">📝 Blog Articles</label>
                                                    <select
                                                        value={generalData.dash_posts_per_page}
                                                        onChange={(e) => setGeneralData('dash_posts_per_page', e.target.value)}
                                                        className="w-full rounded-lg border border-theme-border/60 bg-theme-card text-theme-text focus:border-theme-primary focus:ring-1 focus:ring-theme-primary p-2.5 text-sm focus:outline-none transition duration-150"
                                                    >
                                                        {[2, 5, 10, 15, 20, 50].map((num) => (
                                                            <option key={num} value={num}>{num} per page</option>
                                                        ))}
                                                    </select>
                                                    <p className="text-xxs text-theme-muted">Articles shown in the admin posts table.</p>
                                                    {generalErrors.dash_posts_per_page && <p className="text-red-500 text-xs mt-1">{generalErrors.dash_posts_per_page}</p>}
                                                </div>

                                                <div className="bg-theme-main/50 border border-theme-border/50 rounded-xl p-4 space-y-2">
                                                    <label className="block text-xs font-extrabold text-theme-text uppercase tracking-wider">🏷️ Categories</label>
                                                    <select
                                                        value={generalData.dash_categories_per_page}
                                                        onChange={(e) => setGeneralData('dash_categories_per_page', e.target.value)}
                                                        className="w-full rounded-lg border border-theme-border/60 bg-theme-card text-theme-text focus:border-theme-primary focus:ring-1 focus:ring-theme-primary p-2.5 text-sm focus:outline-none transition duration-150"
                                                    >
                                                        {[2, 5, 10, 15, 20, 50].map((num) => (
                                                            <option key={num} value={num}>{num} per page</option>
                                                        ))}
                                                    </select>
                                                    <p className="text-xxs text-theme-muted">Categories shown in the taxonomy manager.</p>
                                                    {generalErrors.dash_categories_per_page && <p className="text-red-500 text-xs mt-1">{generalErrors.dash_categories_per_page}</p>}
                                                </div>

                                                <div className="bg-theme-main/50 border border-theme-border/50 rounded-xl p-4 space-y-2">
                                                    <label className="block text-xs font-extrabold text-theme-text uppercase tracking-wider">💬 Comment Moderation</label>
                                                    <select
                                                        value={generalData.dash_comments_per_page}
                                                        onChange={(e) => setGeneralData('dash_comments_per_page', e.target.value)}
                                                        className="w-full rounded-lg border border-theme-border/60 bg-theme-card text-theme-text focus:border-theme-primary focus:ring-1 focus:ring-theme-primary p-2.5 text-sm focus:outline-none transition duration-150"
                                                    >
                                                        {[2, 5, 10, 15, 20, 50].map((num) => (
                                                            <option key={num} value={num}>{num} per page</option>
                                                        ))}
                                                    </select>
                                                    <p className="text-xxs text-theme-muted">Comments shown in the moderation queue.</p>
                                                    {generalErrors.dash_comments_per_page && <p className="text-red-500 text-xs mt-1">{generalErrors.dash_comments_per_page}</p>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-theme-text mb-2">Homepage Title</label>
                                                <input 
                                                    type="text"
                                                    value={generalData.homepage_title}
                                                    onChange={(e) => setGeneralData('homepage_title', e.target.value)}
                                                    className="w-full rounded-xl border border-theme-border/60 bg-theme-main text-theme-text focus:border-theme-primary focus:ring-1 focus:ring-theme-primary p-3 text-sm focus:outline-none transition duration-150"
                                                    placeholder="Enter homepage title"
                                                    required
                                                />
                                                {generalErrors.homepage_title && <p className="text-red-500 text-xs mt-1">{generalErrors.homepage_title}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-theme-text mb-2">Homepage Subtitle</label>
                                                <input 
                                                    type="text"
                                                    value={generalData.homepage_subtitle}
                                                    onChange={(e) => setGeneralData('homepage_subtitle', e.target.value)}
                                                    className="w-full rounded-xl border border-theme-border/60 bg-theme-main text-theme-text focus:border-theme-primary focus:ring-1 focus:ring-theme-primary p-3 text-sm focus:outline-none transition duration-150"
                                                    placeholder="Enter homepage subtitle"
                                                    required
                                                />
                                                {generalErrors.homepage_subtitle && <p className="text-red-500 text-xs mt-1">{generalErrors.homepage_subtitle}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Logo Upload */}
                                            <div className="space-y-3">
                                                <label className="block text-sm font-bold text-theme-text">Custom Brand Logo</label>
                                                <div className="flex items-center gap-4">
                                                    {settings.logo && (
                                                        <div className="h-14 w-28 bg-theme-main rounded-xl border border-theme-border/60 flex items-center justify-center p-2">
                                                            <img src={settings.logo} alt="Brand Logo" className="h-full w-full object-contain" />
                                                        </div>
                                                    )}
                                                    <input 
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setGeneralData('logo', e.target.files[0])}
                                                        className="block w-full text-xs text-theme-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-theme-primary file:text-white hover:file:bg-theme-primary-hover cursor-pointer"
                                                    />
                                                </div>
                                                <p className="text-xxs text-theme-muted">Recommended size: 240x80px. Transparent PNG or SVG.</p>
                                                {generalErrors.logo && <p className="text-red-500 text-xs mt-1">{generalErrors.logo}</p>}
                                            </div>

                                            {/* Favicon Upload */}
                                            <div className="space-y-3">
                                                <label className="block text-sm font-bold text-theme-text">Custom Website Favicon</label>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-14 w-14 bg-theme-main rounded-xl border border-theme-border/60 flex items-center justify-center p-3">
                                                        <img src={settings.favicon} alt="Favicon" className="h-full w-full object-contain" />
                                                    </div>
                                                    <input 
                                                        type="file"
                                                        accept=".ico,.png,.svg"
                                                        onChange={(e) => setGeneralData('favicon', e.target.files[0])}
                                                        className="block w-full text-xs text-theme-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-theme-primary file:text-white hover:file:bg-theme-primary-hover cursor-pointer"
                                                    />
                                                </div>
                                                <p className="text-xxs text-theme-muted">Standard 16x16px or 32x32px. Supported formats: .ico, .png, .svg.</p>
                                                {generalErrors.favicon && <p className="text-red-500 text-xs mt-1">{generalErrors.favicon}</p>}
                                            </div>
                                        </div>

                                        {/* Website Footer Configuration */}
                                        <div className="border-t border-theme-border/60 pt-5">
                                            <div>
                                                <label className="block text-sm font-bold text-theme-text mb-2">Website Footer Copy</label>
                                                <input 
                                                    type="text"
                                                    value={generalData.site_footer}
                                                    onChange={(e) => setGeneralData('site_footer', e.target.value)}
                                                    className="w-full rounded-xl border border-theme-border/60 bg-theme-main text-theme-text focus:border-theme-primary focus:ring-1 focus:ring-theme-primary p-3 text-sm focus:outline-none transition duration-150"
                                                    placeholder="e.g. © 2026 LaraBlog. Built with Laravel & React."
                                                    required
                                                />
                                                <p className="text-xxs text-theme-muted mt-1">This text is displayed globally at the bottom of public pages.</p>
                                                {generalErrors.site_footer && <p className="text-red-500 text-xs mt-1">{generalErrors.site_footer}</p>}
                                            </div>
                                        </div>

                                        {/* Gallery Looping Control Option — Premium Toggle Switch */}
                                        <div className="border-t border-theme-border/60 pt-6">
                                            <div className="flex items-center justify-between gap-6 p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer"
                                                style={{ borderColor: generalData.gallery_infinite_loop ? 'var(--color-primary)' : 'rgba(var(--border-rgb, 100,116,139),0.4)', background: generalData.gallery_infinite_loop ? 'color-mix(in srgb, var(--color-primary) 6%, transparent)' : 'var(--color-card)' }}
                                                onClick={() => setGeneralData('gallery_infinite_loop', !generalData.gallery_infinite_loop)}
                                            >
                                                {/* Label Side */}
                                                <div className="flex items-start gap-3">
                                                    <span className="text-2xl mt-0.5">🔁</span>
                                                    <div>
                                                        <span className="block text-sm font-extrabold text-theme-text">Loop Gallery Images Infinitely</span>
                                                        <span className="block text-xs text-theme-muted mt-1 leading-relaxed max-w-lg">
                                                            {generalData.gallery_infinite_loop
                                                                ? '✅ Enabled — Clicking next on the last image loops back to Image 1 infinitely.'
                                                                : '🛑 Disabled — Slider stops at the boundary. Next/Prev arrows hide at the first and last image.'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Toggle Switch */}
                                                <div className="flex-shrink-0">
                                                    <input
                                                        type="checkbox"
                                                        id="gallery_infinite_loop_toggle"
                                                        checked={generalData.gallery_infinite_loop}
                                                        onChange={(e) => setGeneralData('gallery_infinite_loop', e.target.checked)}
                                                        className="sr-only"
                                                    />
                                                    <div
                                                        className={`relative inline-flex items-center h-8 w-16 rounded-full border-2 transition-all duration-300 shadow-inner ${
                                                            generalData.gallery_infinite_loop
                                                                ? 'bg-theme-primary border-theme-primary'
                                                                : 'bg-theme-main border-theme-border/60'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`absolute top-0.5 h-6 w-6 rounded-full shadow-md transition-all duration-300 flex items-center justify-center text-xs font-extrabold ${
                                                                generalData.gallery_infinite_loop
                                                                    ? 'translate-x-8 bg-white text-theme-primary'
                                                                    : 'translate-x-0.5 bg-theme-border text-theme-muted'
                                                            }`}
                                                        >
                                                            {generalData.gallery_infinite_loop ? '✓' : '✕'}
                                                        </span>
                                                    </div>
                                                    <span className={`block text-center text-xs font-extrabold mt-1.5 ${generalData.gallery_infinite_loop ? 'text-theme-primary' : 'text-theme-muted'}`}>
                                                        {generalData.gallery_infinite_loop ? 'ON' : 'OFF'}
                                                    </span>
                                                </div>
                                            </div>
                                            {generalErrors.gallery_infinite_loop && <p className="text-red-500 text-xs mt-2">{generalErrors.gallery_infinite_loop}</p>}
                                        </div>

                                        {/* Dynamic Email Verification Settings Option — Premium Toggle Switch */}
                                         <div className="border-t border-theme-border/60 pt-6">
                                             <div className="flex items-center justify-between gap-6 p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer"
                                                 style={{ borderColor: generalData.email_verification_enabled ? 'var(--color-primary)' : 'rgba(var(--border-rgb, 100,116,139),0.4)', background: generalData.email_verification_enabled ? 'color-mix(in srgb, var(--color-primary) 6%, transparent)' : 'var(--color-card)' }}
                                                 onClick={() => setGeneralData('email_verification_enabled', !generalData.email_verification_enabled)}
                                             >
                                                 {/* Label Side */}
                                                 <div className="flex items-start gap-3">
                                                     <span className="text-2xl mt-0.5">📧</span>
                                                     <div>
                                                         <span className="block text-sm font-extrabold text-theme-text">Enforce Email Verification System</span>
                                                         <span className="block text-xs text-theme-muted mt-1 leading-relaxed max-w-lg">
                                                             {generalData.email_verification_enabled
                                                                 ? '✅ Enabled — Standard front-end users must verify their email addresses via link before they are allowed to log in and access features.'
                                                                 : '🛑 Disabled — Front-end users can register and log in instantly without any email verification requirement.'}
                                                         </span>
                                                     </div>
                                                 </div>

                                                 {/* Toggle Switch */}
                                                 <div className="flex-shrink-0">
                                                     <input
                                                         type="checkbox"
                                                         id="email_verification_enabled_toggle"
                                                         checked={generalData.email_verification_enabled}
                                                         onChange={(e) => setGeneralData('email_verification_enabled', e.target.checked)}
                                                         className="sr-only"
                                                     />
                                                     <div
                                                         className={`relative inline-flex items-center h-8 w-16 rounded-full border-2 transition-all duration-300 shadow-inner ${
                                                             generalData.email_verification_enabled
                                                                 ? 'bg-theme-primary border-theme-primary'
                                                                 : 'bg-theme-main border-theme-border/60'
                                                         }`}
                                                     >
                                                         <span
                                                             className={`absolute top-0.5 h-6 w-6 rounded-full shadow-md transition-all duration-300 flex items-center justify-center text-xs font-extrabold ${
                                                                 generalData.email_verification_enabled
                                                                     ? 'translate-x-8 bg-white text-theme-primary'
                                                                     : 'translate-x-0.5 bg-theme-border text-theme-muted'
                                                             }`}
                                                         >
                                                             {generalData.email_verification_enabled ? '✓' : '✕'}
                                                         </span>
                                                     </div>
                                                     <span className={`block text-center text-xs font-extrabold mt-1.5 ${generalData.email_verification_enabled ? 'text-theme-primary' : 'text-theme-muted'}`}>
                                                         {generalData.email_verification_enabled ? 'ON' : 'OFF'}
                                                     </span>
                                                 </div>
                                             </div>
                                             {generalErrors.email_verification_enabled && <p className="text-red-500 text-xs mt-2">{generalErrors.email_verification_enabled}</p>}
                                         </div>
                                    </div>

                                    {/* Theme Settings Section */}
                                    <div className="space-y-4">
                                        <h5 className="text-lg font-extrabold text-theme-text border-b border-theme-border/60 pb-3">Choose Site Color Palette</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {themesList.map((t) => (
                                                <div 
                                                    key={t.value} 
                                                    onClick={() => {
                                                        setSelectedTheme(t.value);
                                                        setGeneralData('theme', t.value);
                                                    }}
                                                    className={`cursor-pointer group p-5 rounded-2xl border-2 transition-all duration-300 ${
                                                        selectedTheme === t.value 
                                                            ? 'border-theme-primary bg-theme-primary/5 shadow-theme-md scale-[1.02]' 
                                                            : 'border-theme-border bg-theme-card/30 hover:border-theme-primary/40 hover:scale-[1.01]'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="font-bold text-theme-text text-base group-hover:text-theme-primary transition-colors">{t.name}</span>
                                                        <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                                            selectedTheme === t.value 
                                                                ? 'border-theme-primary bg-theme-primary text-white' 
                                                                : 'border-theme-border bg-transparent'
                                                        }`}>
                                                            {selectedTheme === t.value && (
                                                                <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-theme-muted mb-4 leading-relaxed">{t.desc}</p>
                                                    
                                                    {/* Theme Palette Preview */}
                                                    <div className="flex gap-1.5">
                                                        {t.palette.map((color, idx) => (
                                                            <span key={idx} className="h-6 w-full rounded-md shadow-theme-xs border border-black/10" style={{ backgroundColor: color }}></span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-5 border-t border-theme-border/60">
                                        <button
                                            type="submit"
                                            disabled={processingGeneral}
                                            className="bg-theme-primary hover:bg-theme-primary-hover text-white font-bold py-2.5 px-6 rounded-xl shadow-theme-md hover:shadow-theme-lg transition-all duration-200 text-sm flex items-center gap-2 border border-theme-primary/10"
                                        >
                                            {processingGeneral ? 'Saving Settings...' : 'Apply Site Settings'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* --- TAB: USER COMMENTS & REVIEWS --- */}
                        {activeTab === 'my-comments' && !isAdmin && (
                            <div className="space-y-6">
                                <h4 className="text-xl font-extrabold tracking-tight text-theme-text">My Reviews & Star Comments</h4>

                                {myComments.data.length === 0 ? (
                                    <div className="text-center py-16 bg-theme-main/20 border border-dashed border-theme-border rounded-2xl">
                                        <p className="text-theme-muted mb-4 font-semibold">You haven't left any comments or ratings yet.</p>
                                        <Link href={route('posts.index')} className="text-theme-primary font-bold hover:underline">Explore blog posts</Link>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {myComments.data.map((comment) => (
                                            <div key={comment.id} className="p-6 rounded-2xl border border-theme-border bg-theme-card shadow-theme-xs hover:shadow-theme-sm transition-all duration-200">
                                                <div className="flex flex-wrap justify-between items-start gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="text-xs text-theme-muted font-medium">Reviewed: </span>
                                                            <Link 
                                                                href={route('posts.show', comment.post?.slug || '#')} 
                                                                className="font-extrabold text-theme-primary hover:underline max-w-sm truncate text-sm"
                                                            >
                                                                {comment.post?.title || 'Deleted Post'}
                                                            </Link>
                                                        </div>
                                                        {comment.rating && (
                                                            <div className="flex text-amber-400 mt-1.5">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <svg key={star} className={`w-3.5 h-3.5 ${star <= comment.rating ? 'fill-current' : 'text-theme-border'}`} fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                    </svg>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="text-red-500 hover:text-red-700 text-xs font-extrabold border border-red-500/20 rounded-xl px-3 py-1.5 hover:bg-red-500/10 transition-all duration-150"
                                                    >
                                                        Delete Review
                                                    </button>
                                                </div>

                                                <p className="mt-4 text-sm text-theme-text bg-theme-main/15 p-4 rounded-xl border border-theme-border/30 whitespace-pre-wrap leading-relaxed">
                                                    {comment.content}
                                                </p>

                                                <div className="flex justify-between items-center mt-4 text-xs text-theme-muted">
                                                    <span>Posted on: {new Date(comment.created_at).toLocaleDateString()}</span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xxs font-extrabold uppercase border ${
                                                        comment.is_approved 
                                                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    }`}>
                                                        {comment.is_approved ? 'Live / Published' : 'Pending Moderation'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                {myComments.links && myComments.links.length > 3 && (
                                    <div className="mt-6 flex justify-center">
                                        {myComments.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-3.5 py-2 mx-1 rounded-xl border text-sm transition-all duration-150 ${
                                                    link.active 
                                                        ? 'bg-theme-primary text-white border-theme-primary shadow-theme-xs' 
                                                        : 'bg-theme-card text-theme-muted border-theme-border/60 hover:bg-theme-main/50 hover:text-theme-text'
                                                } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- TAB: USER PROFILE INFO --- */}
                        {activeTab === 'profile-info' && !isAdmin && (
                            <div className="max-w-xl space-y-6">
                                <h4 className="text-xl font-extrabold tracking-tight text-theme-text">Account Information</h4>
                                
                                <div className="space-y-4 bg-theme-main/15 p-6 rounded-2xl border border-theme-border/60 shadow-theme-xs">
                                    <div className="flex justify-between border-b border-theme-border/50 pb-3.5">
                                        <span className="text-sm font-semibold text-theme-muted">Name</span>
                                        <span className="text-sm font-extrabold text-theme-text">{auth.user.name}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-theme-border/50 pb-3.5">
                                        <span className="text-sm font-semibold text-theme-muted">Email Address</span>
                                        <span className="text-sm font-extrabold text-theme-text">{auth.user.email}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-theme-border/50 pb-3.5">
                                        <span className="text-sm font-semibold text-theme-muted">Member Since</span>
                                        <span className="text-sm font-extrabold text-theme-text">{new Date(auth.user.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-semibold text-theme-muted">Account Access</span>
                                        <span className="text-sm font-extrabold text-theme-text uppercase">Standard Member</span>
                                    </div>
                                </div>
                                
                                <div className="pt-2">
                                    <Link
                                        href={route('profile.edit')}
                                        className="inline-flex bg-theme-primary hover:bg-theme-primary-hover text-white font-bold py-2.5 px-6 rounded-xl shadow-theme-md transition duration-150 text-sm"
                                    >
                                        Edit Profile Settings
                                    </Link>
                                </div>
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
            {/* Category Add/Edit Modal */}
            {categoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md bg-theme-card border border-theme-border rounded-2xl p-6 shadow-theme-xl animate-scale-in">
                        <div className="flex justify-between items-center border-b border-theme-border/60 pb-4 mb-4">
                            <h4 className="text-lg font-extrabold text-theme-text">
                                {editingCategory ? 'Edit Blog Category' : 'Create New Category'}
                            </h4>
                            <button onClick={closeCategoryModal} className="text-theme-muted hover:text-theme-text text-xl">&times;</button>
                        </div>
                        <form onSubmit={handleCategorySubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-theme-text mb-2">Category Name</label>
                                <input 
                                    type="text"
                                    value={categoryData.name}
                                    onChange={(e) => setCategoryData('name', e.target.value)}
                                    className="w-full rounded-xl border border-theme-border bg-theme-main text-theme-text focus:border-theme-primary focus:ring-1 focus:ring-theme-primary p-3 text-sm focus:outline-none transition duration-150"
                                    placeholder="e.g. Technology, Lifestyle"
                                    required
                                    autoFocus
                                />
                                {categoryErrors.name && <p className="text-red-500 text-xs mt-1">{categoryErrors.name}</p>}
                            </div>
                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={closeCategoryModal}
                                    className="px-4 py-2 text-sm font-bold text-theme-text bg-theme-main/50 hover:bg-theme-main border border-theme-border rounded-xl transition duration-150"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processingCategory}
                                    className="px-5 py-2 text-sm font-bold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-xl shadow-theme-md transition duration-150"
                                >
                                    {processingCategory ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Reusable Delete Confirmation Modal */}
            {deleteModalOpen && deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
                    <div className="w-full max-w-md bg-theme-card border-2 border-red-500/25 rounded-3xl p-6 md:p-8 shadow-2xl animate-scale-in text-center space-y-6">
                        {/* Red Alert Banner SVG */}
                        <div className="mx-auto h-16 w-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center border border-red-500/20 shadow-inner">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        
                        <div className="space-y-2">
                            <h4 className="text-xl font-extrabold text-theme-text tracking-tight">Confirm Deletion</h4>
                            <p className="text-sm text-theme-muted leading-relaxed">
                                Are you absolutely sure you want to permanently delete <span className="font-extrabold text-red-500">{deleteTarget.label}</span>? This action is immediate and cannot be undone.
                            </p>
                        </div>

                        {/* Buttons Panel */}
                        <div className="flex gap-4 pt-2">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                className="w-full py-3 text-sm font-extrabold text-theme-text bg-theme-main border border-theme-border/60 hover:bg-theme-main-hover rounded-xl shadow-theme-sm transition-all duration-150"
                            >
                                No, Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="w-full py-3 text-sm font-extrabold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl shadow-md shadow-red-500/15 hover:shadow-lg transition-all duration-150"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
