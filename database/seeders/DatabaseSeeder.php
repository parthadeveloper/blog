<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Setting;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
        ]);

        // Seed Admin Account
        $admin = User::factory()->create([
            'name' => 'Blog Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Seed Standard User Accounts
        $user1 = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'user@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
        ]);

        $user2 = User::factory()->create([
            'name' => 'Sarah Jenkins',
            'email' => 'sarah@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
        ]);

        $user3 = User::factory()->create([
            'name' => 'David Miller',
            'email' => 'david@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
        ]);

        $user4 = User::factory()->create([
            'name' => 'Emily Watson',
            'email' => 'emily@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
        ]);

        // Retrieve Categories
        $tech = Category::where('slug', 'technology')->first();
        $travel = Category::where('slug', 'travel')->first();
        $lifestyle = Category::where('slug', 'lifestyle')->first();
        $health = Category::where('slug', 'health')->first();

        // Seed Article 1: Technology
        $post1 = Post::create([
            'user_id' => $admin->id,
            'category_id' => $tech->id,
            'title' => 'The Rise of Artificial Intelligence in Modern Web Design',
            'slug' => 'rise-of-ai-modern-web-design',
            'image' => 'seeder-images/tech-cover.jpg',
            'gallery_images' => [
                'seeder-images/tech-gallery-1.jpg',
                'seeder-images/tech-gallery-2.jpg',
                'seeder-images/tech-gallery-3.jpg'
            ],
            'content' => '<p>Artificial intelligence is no longer just a futuristic concept; it is actively shaping the landscape of modern web design and development. Designers are leveraging advanced machine learning algorithms to automate layout creation, recommend tailored color schemes, and optimize user experience (UX) flows in real-time.</p><h3>The Evolution of Visual Systems</h3><p>Traditionally, crafting custom web visuals and glassmorphic micro-animations required hours of manual tweaking. Today, automated tools analyze color contrast, alignment, and responsiveness instantly, enabling developers to build state-of-the-art interactive web portals that perform flawlessly across devices. This shift frees up creative space for deeper UX analysis and customized visual storytelling.</p><h3>Enhanced Personalization</h3><p>By using real-time predictive models, websites can adapt their structure dynamically to suit individual user behavior. From switching themes based on system preferences to personalizing content layouts, the modern web has become a fluid, reactive ecosystem.</p>',
            'is_published' => true,
        ]);

        // Seed Article 2: Travel
        $post2 = Post::create([
            'user_id' => $admin->id,
            'category_id' => $travel->id,
            'title' => 'Chasing Sunsets: 10 Days in Kyoto, Japan',
            'slug' => 'chasing-sunsets-kyoto-japan',
            'image' => 'seeder-images/travel-cover.jpg',
            'gallery_images' => [
                'seeder-images/travel-gallery-1.jpg',
                'seeder-images/travel-gallery-2.jpg',
                'seeder-images/travel-gallery-3.jpg'
            ],
            'content' => '<p>Kyoto, the historical and cultural heart of Japan, offers an unmatched blend of serene temples, traditional wooden houses, and lush, picturesque gardens. Spending ten days in this wonderful city feels like stepping directly into a masterpiece painting.</p><h3>Vibrant Autumn Colors</h3><p>Walking through the vermillion gates of Fushimi Inari-taisha during the quiet hours of dawn is a deeply spiritual experience. The sunlight filters through the arches, casting warm, dramatic shadows along the winding mountain path. In autumn, the maple leaves turn vibrant shades of crimson and orange, framing ancient pagodas in stunning beauty.</p><h3>Traditional Tea Ceremonies</h3><p>Participating in an authentic Japanese tea ceremony in the historic Gion district provides a valuable lesson in mindfulness. Every deliberate movement, from cleaning the tea bowls to whisking the rich matcha, emphasizes presence, elegance, and deep respect for guests.</p>',
            'is_published' => true,
        ]);

        // Seed Article 3: Lifestyle
        $post3 = Post::create([
            'user_id' => $admin->id,
            'category_id' => $lifestyle->id,
            'title' => 'Mastering the Art of Mindful Living and Minimalism',
            'slug' => 'art-of-mindful-living-minimalism',
            'image' => 'seeder-images/lifestyle-cover.jpg',
            'gallery_images' => [
                'seeder-images/lifestyle-gallery-1.jpg',
                'seeder-images/lifestyle-gallery-2.jpg'
            ],
            'content' => '<p>In today\'s fast-paced, high-connectivity world, our minds are constantly flooded with information. Embracing minimalism and mindful habits is not about throwing away your belongings; it is about reclaiming mental clarity and focusing on what truly matters.</p><h3>Simplifying Your Workspace</h3><p>A cluttered physical space inevitably leads to a distracted mind. By designing a clean, organized, and minimalistic desk setup, you reduce unnecessary visual friction. Keep only the essential tools nearby, choose high-quality items that bring joy, and allow natural light to fill your workspace.</p><h3>The Power of Daily Rituals</h3><p>Starting the morning without immediate screen time allows you to align your mind. Ten minutes of light stretching, journaling your goals, or enjoying a quiet cup of coffee establishes a calm, productive tone that lasts the entire day.</p>',
            'is_published' => true,
        ]);

        // Seed Article 4: Health
        $post4 = Post::create([
            'user_id' => $admin->id,
            'category_id' => $health->id,
            'title' => 'Nutrient-Dense Superfoods to Fuel Your Workday',
            'slug' => 'nutrient-dense-superfoods-fuel-workday',
            'image' => 'seeder-images/health-cover.jpg',
            'gallery_images' => [
                'seeder-images/health-gallery-1.jpg',
                'seeder-images/health-gallery-2.jpg'
            ],
            'content' => '<p>Maintaining optimal focus and energy levels throughout the workday is directly tied to the food we choose to fuel our bodies. Avoiding heavy, processed snacks and replacing them with nutrient-dense superfoods keeps your concentration sharp and prevents the mid-afternoon crash.</p><h3>Antioxidant-Rich Brain Fuel</h3><p>Blueberries, dark chocolate, and walnuts are packed with essential antioxidants and healthy fats that support cognitive performance. Keep small portions at your desk for quick, delicious, and healthy snacks during intensive tasks.</p><h3>Hydration and Sustainable Energy</h3><p>Oftentimes, a sudden drop in productivity is a symptom of mild dehydration. Integrating herbal teas, lemon-infused water, and leafy greens keeps your cells hydrated, leading to robust physical energy and enhanced problem-solving efficiency.</p>',
            'is_published' => true,
        ]);

        // --- SEED COMMENTS (Approved and Pending Moderation) ---

        // Comments on Post 1 (AI in Web Design)
        Comment::create([
            'user_id' => $user4->id, // Emily Watson
            'post_id' => $post1->id,
            'content' => 'This is a brilliant overview of modern UI trends. AI generation combined with standard design principles can really accelerate high-fidelity mockups.',
            'rating' => 5,
            'is_approved' => true,
        ]);

        Comment::create([
            'user_id' => $user3->id, // David Miller
            'post_id' => $post1->id,
            'content' => 'Very informative article! I love the glassmorphism aesthetic and how it integrates with modern design systems.',
            'rating' => 4,
            'is_approved' => true,
        ]);

        // PENDING MODERATION (for demo)
        Comment::create([
            'user_id' => $user2->id, // Sarah Jenkins
            'post_id' => $post1->id,
            'content' => 'Excellent points, but how can we ensure AI design systems maintain top-tier accessibility (WCAG compliance)? Sometimes contrast checks are overlooked.',
            'rating' => 3,
            'is_approved' => false,
        ]);

        // Comments on Post 2 (Kyoto, Japan)
        Comment::create([
            'user_id' => $user1->id, // John Doe
            'post_id' => $post2->id,
            'content' => 'Kyoto is absolutely magical. Fushimi Inari is breathtaking at dawn before the crowds arrive. Wonderful post and pictures!',
            'rating' => 5,
            'is_approved' => true,
        ]);

        // PENDING MODERATION (for demo)
        Comment::create([
            'user_id' => $user4->id, // Emily Watson
            'post_id' => $post2->id,
            'content' => 'Which traditional ryokan did you stay at? The photos look super premium and comfy! Would love to get a recommendation for my trip next spring.',
            'rating' => 5,
            'is_approved' => false,
        ]);

        // Comments on Post 3 (Minimalism)
        Comment::create([
            'user_id' => $user3->id, // David Miller
            'post_id' => $post3->id,
            'content' => 'Minimalism changed my productivity completely. A clean workspace really equals a clean, calm mind. Fully recommend this!',
            'rating' => 5,
            'is_approved' => true,
        ]);

        // Seed Site Setting Theme
        Setting::set('site_theme', 'theme-emerald');
    }
}

