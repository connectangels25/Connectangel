import { useNavigate } from "react-router-dom";
import { Calendar, Clock, ArrowRight, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

const BLOG_POSTS = [
  {
    id: 1,
    category: "Startup",
    title: "How to Pitch Your Startup to Angel Investors in 2025",
    excerpt: "Learn the proven frameworks top founders use to craft compelling pitches that secure funding from angel investors worldwide.",
    author: "ConnectAngels Team",
    date: "Mar 28, 2025",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    category: "Tech",
    title: "AI Trends Shaping the Future of Startup Ecosystems",
    excerpt: "From generative AI to autonomous agents — discover how artificial intelligence is transforming how startups build, scale, and raise capital.",
    author: "Editorial",
    date: "Mar 22, 2025",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    category: "Funding",
    title: "Global Demo Days: Your Fast Track to Series A",
    excerpt: "Why participating in international demo days can accelerate your fundraising timeline and open doors to cross-border investors.",
    author: "ConnectAngels Team",
    date: "Mar 15, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    category: "Growth",
    title: "Building a Community-Led Growth Strategy for Your Startup",
    excerpt: "Community-driven growth is the new playbook. Learn how early-stage founders can leverage communities to scale faster.",
    author: "Editorial",
    date: "Mar 10, 2025",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
  },
  {
    id: 5,
    category: "Tech",
    title: "Web3 and Decentralized Fundraising: What Founders Need to Know",
    excerpt: "Token-based fundraising, DAOs, and decentralized equity — the new frontier for startup capital is evolving rapidly.",
    author: "ConnectAngels Team",
    date: "Mar 5, 2025",
    readTime: "9 min read",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=400&fit=crop",
  },
  {
    id: 6,
    category: "Startup",
    title: "Top 10 Accelerator Programs Every Founder Should Apply To",
    excerpt: "A curated list of the best global accelerator programs that provide mentorship, funding, and network access for early-stage startups.",
    author: "Editorial",
    date: "Feb 28, 2025",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&h=400&fit=crop",
  },
];

const CATEGORIES = ["All", "Startup", "Tech", "Funding", "Growth"];

export default function BlogPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Header */}
      <section className="px-6 py-16 text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
          Blog & Insights
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Startup News & Resources
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Stay updated with the latest in startup ecosystems, funding strategies, and technology trends.
        </p>
      </section>

      {/* Category Filters */}
      <section className="px-6 mb-8">
        <div className="flex gap-3 justify-center flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                cat === "All"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Blog Grid */}
      <section className="px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/30 transition-colors cursor-pointer group"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold mb-3">
                  {post.category}
                </span>
                <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readTime}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Floating Chat */}
      <button
        onClick={() => navigate("/chat")}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
        aria-label="Chat with us"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
