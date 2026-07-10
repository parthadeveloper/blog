import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PublicLayout from '@/Layouts/PublicLayout';

export default function Index({ auth, posts }) {
    const Layout = auth.user ? AuthenticatedLayout : PublicLayout;
    const { settings, asset_url } = usePage().props;
    const theme = settings?.theme || 'theme-emerald';

    const resolveUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('https')) return path;
        const cleanPath = path.replace(/^\/?storage\//, '').replace(/^\//, '');
        return `${asset_url || '/storage'}/${cleanPath}`;
    };

    return (
        <Layout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="font-extrabold text-3xl tracking-tight text-theme-text leading-tight">
                            {usePage().props.settings?.homepage_title || 'Latest Publications'}
                        </h2>
                        <p className="text-sm text-theme-muted mt-1">
                            {usePage().props.settings?.homepage_subtitle || 'Explore insightful articles, tutorials, and travel diaries curated by the community.'}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Publications" />

            <div className={`${theme} py-4 animate-fade-in font-sans`}>
                {posts.data.length === 0 ? (
                    <div className="text-center py-20 bg-theme-card rounded-2xl border border-dashed border-theme-border/60">
                        <p className="text-theme-muted font-semibold text-lg mb-4">No articles have been posted yet.</p>
                        {auth.user?.role === 'admin' ? (
                            <Link href={route('posts.create')} className="bg-theme-primary hover:bg-theme-primary-hover text-white font-bold py-2.5 px-6 rounded-xl shadow-theme-md transition duration-200">
                                Compose First Article
                            </Link>
                        ) : (
                            <p className="text-xs text-theme-muted">Sign in as Admin to seed or draft blog content.</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.data.map((post) => (
                                <div key={post.id} className="bg-theme-card overflow-hidden shadow-theme-sm hover:shadow-theme-md rounded-2xl border border-theme-border/60 hover:scale-[1.01] transition-all duration-300 flex flex-col group h-full">
                                    {post.image ? (
                                        <div className="overflow-hidden h-52 relative">
                                            <img 
                                                src={resolveUrl(post.image)} 
                                                alt={post.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <span className="absolute top-4 left-4 bg-theme-primary text-white text-xxs font-extrabold px-3 py-1.5 rounded-lg border border-white/10 tracking-wider uppercase shadow-theme-sm">
                                                {post.category.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="h-52 bg-gradient-to-tr from-theme-primary/10 to-theme-primary/5 border-b border-theme-border/60 flex items-center justify-center relative">
                                            <span className="absolute top-4 left-4 bg-theme-primary text-white text-xxs font-extrabold px-3 py-1.5 rounded-lg tracking-wider uppercase shadow-theme-sm">
                                                {post.category.name}
                                            </span>
                                            <svg className="w-16 h-16 text-theme-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                            </svg>
                                        </div>
                                    )}
                                    
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex items-center text-xs text-theme-muted mb-3 font-semibold">
                                            <span>{new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                            <span className="mx-2 opacity-50">•</span>
                                            <span>By {post.user.name}</span>
                                        </div>
                                        
                                        <h3 className="text-xl font-extrabold tracking-tight text-theme-text mb-3 leading-snug group-hover:text-theme-primary transition-colors">
                                            <Link href={route('posts.show', post.slug)}>
                                                {post.title}
                                            </Link>
                                        </h3>

                                        <p className="text-theme-muted text-sm line-clamp-3 mb-4 leading-relaxed flex-grow">
                                            {(() => {
                                                if (!post.content) return '';
                                                const stripped = post.content.replace(/<[^>]*>/g, ' '); // Strip HTML tags cleanly
                                                return stripped.length > 150 ? stripped.substring(0, 150) + '...' : stripped;
                                            })()}
                                        </p>

                                        {/* Star Rating & Comment Count */}
                                        <div className="pt-4 mt-auto border-t border-theme-border/50 flex items-center justify-between">
                                            <div className="flex items-center space-x-1.5">
                                                {post.average_rating ? (
                                                    <div className="flex items-center text-amber-400">
                                                        <svg className="w-4 h-4 fill-current mr-1" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        <span className="font-extrabold text-sm text-theme-text">{parseFloat(post.average_rating).toFixed(1)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-theme-muted italic">Unrated</span>
                                                )}
                                                <span className="text-theme-border">•</span>
                                                <span className="text-xs text-theme-muted font-bold">
                                                    {post.comments_count || 0} {post.comments_count === 1 ? 'review' : 'reviews'}
                                                </span>
                                            </div>

                                            <Link 
                                                href={route('posts.show', post.slug)}
                                                className="inline-flex items-center font-extrabold text-sm text-theme-primary hover:text-theme-primary-hover transition-colors"
                                            >
                                                Read Article
                                                <svg className="ml-1.5 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {posts.links && posts.links.length > 3 && (
                            <div className="mt-12 flex justify-center">
                                {posts.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3.5 py-2 mx-1 rounded-xl border text-sm font-semibold transition-all duration-150 ${
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
            </div>
        </Layout>
    );
}
