# Requirements Specification: Advanced Blog System

This document outlines the functional, non-functional, security, and technical requirements of the **Advanced Blog System**, built using **Laravel 11, Inertia.js, and React**.

---

## 1. Functional Requirements

### 1.1 User Authentication & Profile Management
- **User Registration & Login**: Users must be able to securely register accounts and log in using email and password.
- **Forgot Password Workflow**: Standard Breeze-powered password reset workflow where standard SMTP or logged email links allow the user to securely pick a new password.
- **Role Separation**:
  - **Admin (`role === 'admin'`)**: Access to write, edit, and delete posts, categories, and moderate comments.
  - **Standard User (`role === 'user'`)**: Access to read posts, submit ratings & comments, and manage their personal comment history.
- **My Profile Panel**: Users can view their profile details and change their password/details.

### 1.2 Blog Post Administration (Admin Only)
- **CRUD Operations**: Admins can Create, Read, Update, and Delete posts.
- **Categorization**: Each post must belong to a category (e.g., Technology, Travel, Food).
- **Status Control**: Posts can be saved as drafts (`is_published: false`) or published immediately (`is_published: true`).
- **Rich Media**: Supports uploading featured header images for blog posts.
- **Dynamic Slug Generation**: Automatically generate unique URL slugs from post titles for clean routing.

### 1.3 Interactive Ratings & Comments (Authenticated Users Only)
- **Comment Form**: Authenticated users can leave textual comments on published blog posts.
- **5-Star Rating System**: Users can rate a post from 1 to 5 stars alongside their text comments.
- **Average Rating Calculation**: The system must dynamically compute and display the average star rating of each post (with database-level aggregate functions to ensure high performance).
- **Personal Review History**: Standard users see a tab in their dashboard listing all reviews they have ever left, with option to delete them.

### 1.4 Comment Moderation (Admin Only)
- **Approval Queue**: New comments must appear on the Admin Dashboard's Comment Moderation tab.
- **Status Toggle**: Admins can approve (publish) or reject (hide) comments. Only approved comments are shown on the public post page or aggregated into public star averages.
- **Comment Deletion**: Admins can delete spam or toxic comments completely.

---

## 2. Non-Functional Requirements

### 2.1 UI/UX & Aesthetics
- **Premium Styling**: Pure, elegant design using Tailwind CSS and standard vanilla modern fonts. Avoid generic colors; use harmonic modern palettes, custom subtle buttons, active hover states, and smooth card shadows.
- **Dynamic Tabbed Layout**: The user and admin dashboards must leverage single-page tabs via React state for an instant, desktop-like responsive feel.
- **Auth CTAs**: Prompt guests to log in/register when trying to comment, maintaining a clean UI.

### 2.2 Performance & Eager Loading
- **No N+1 Queries**: Post statistics (average rating and comment count) must be calculated in a single query using Eloquent's `withCount` and `withAvg` methods in the service layer, preventing heavy DB load.
- **Pagination**: Large collections (posts, user comments, system moderation logs) must be paginated seamlessly.

### 2.3 Security
- **Role Enforcement & Policies**: Limit admin controllers and routes using Laravel policies (`PostPolicy`) and explicit checks. Standard users trying to create/edit posts must receive a `403 | Unauthorized` response.
- **Input Validation**: All forms (comments, posts, registration) must validate input on the server side before persisting data.
- **XSS Protection**: Strip or safely escape HTML inputs in user-submitted comments.

### 2.4 SEO Best Practices
- **Semantic Structure**: Use correct heading hierarchies (`h1` to `h6`) and HTML5 structures.
- **Page Titles**: Unique title tags for each page (e.g., Home page vs Post page vs Forgot Password page).
- **Slug-based URLs**: Clean, human-readable URLs instead of numeric IDs.
