import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const featuredPost = {
  title: "Awakening Tea: Morning Rituals With Jasmine Pearls",
  description:
    "Discover how mindful brewing can uplift the rhythm of your entire day. We share steeping steps, water notes, and the tale behind a cherished blend.",
  author: "By Nilani Silva",
  date: "September 12, 2025",
  image: "/images/bg1.jpg",
  readingTime: "5 min read",
  category: "Tea Rituals",
};

const posts = [
  {
    id: 1,
    title: "From Garden to Cup: Inside Our Single-Origin Green",
    excerpt:
      "Meet the growers crafting this vibrant leaf and learn why altitude, soil, and hand-rolling techniques make every sip so bright.",
    image: "/images/bl2.png",
    author: "By Sahan Jayasekara",
    date: "September 3, 2025",
    readingTime: "6 min read",
    category: "Sourcing Stories",
  },
  {
    id: 2,
    title: "Cold Brew Tea 101: Three Infusions That Shine",
    excerpt:
      "Steep overnight, sip all afternoon. We tested herbals, oolongs, and blacks to find the combinations that stay smooth and refreshing.",
    image: "/images/bl3.png",
    author: "By Priyan Gamage",
    date: "August 28, 2025",
    readingTime: "8 min read",
    category: "Brewing Guides",
  },
  {
    id: 3,
    title: "Pairing Tea With Dessert: A Simple Hosting Guide",
    excerpt:
      "Light sponge cakes, dark chocolate bites, seasonal fruit tarts - here are our go-to pairings for every sweet tooth at the table.",
    image: "/images/bl4.png",
    author: "By Anjalee perea",
    date: "August 18, 2025",
    readingTime: "4 min read",
    category: "Tea Rituals",
  },
  {
    id: 4,
    title: "Sustainable Tea Farming: Our Commitment to the Earth",
    excerpt:
      "Learn about our eco-friendly practices, from organic cultivation to zero-waste packaging that protects both tea quality and our planet.",
    image: "/images/bl6.png",
    author: "By Mihin Athukorala",
    date: "August 15, 2025",
    readingTime: "7 min read",
    category: "Sustainability",
  },
  {
    id: 5,
    title: "The Wellness Benefits of Daily Tea Meditation",
    excerpt:
      "Explore how the simple act of brewing and sipping tea can become a powerful mindfulness practice for mental clarity and inner peace.",
    image: "/images/bl9.png",
    author: "By Nissanka More",
    date: "August 10, 2025",
    readingTime: "5 min read",
    category: "Wellness",
  },
  {
    id: 6,
    title: "Mastering the Perfect Steep: Temperature and Time Guide",
    excerpt:
      "Unlock the secrets to perfect brewing with our comprehensive guide to water temperatures, steeping times, and techniques for every tea type.",
    image: "/images/bl7.png",
    author: "By Nissanaka More",
    date: "August 5, 2025",
    readingTime: "9 min read",
    category: "Brewing Guides",
  },
];

const categories = [
  { name: "Brewing Guides", count: 12, color: "emerald" },
  { name: "Sourcing Stories", count: 8, color: "blue" },
  { name: "Tea Rituals", count: 15, color: "purple" },
  { name: "Sustainability", count: 6, color: "green" },
  { name: "Wellness", count: 10, color: "orange" },
];

// ✅ Hardcoded Tailwind color classes for safe rendering
const getCategoryColor = (category) => {
  const colorMap = {
    "Brewing Guides": "bg-emerald-600",
    "Sourcing Stories": "bg-blue-600",
    "Tea Rituals": "bg-purple-600",
    "Sustainability": "bg-green-600",
    "Wellness": "bg-orange-600",
  };
  return colorMap[category] || "bg-emerald-600";
};

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden h-[600px] sm:h-[700px] lg:h-[520px]">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(7,44,35,0.92) 0%, rgba(12,78,52,0.88) 50%, rgba(13,91,58,0.85) 100%)",
            }}
          />
          <img
            src={featuredPost.image}
            alt="Featured tea story visual"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="relative mx-auto max-w-6xl px-5 pt-32 pb-40 text-white sm:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-1 text-xs uppercase tracking-[0.35em] text-emerald-100">
              Featured Story
            </span>
            <h1 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl max-w-3xl">
              {featuredPost.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-white/80 leading-relaxed">
              {featuredPost.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/80">
              <span>{featuredPost.author}</span>
              <span>{featuredPost.date}</span>
              <span>{featuredPost.readingTime}</span>
            </div>
            <Link
              to="/signup"
              className="mt-8 inline-block rounded-xl bg-white px-5 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              Continue Reading
            </Link>
          </div>
        </section>

        {/* Main Content */}
        <section className="px-5 py-12 sm:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Search + Filters */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-white py-3 pl-10 pr-4 text-sm placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    selectedCategory === "All"
                      ? "bg-emerald-600 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  All Posts
                </button>
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      selectedCategory === category.name
                        ? "bg-emerald-600 text-white"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Grid */}
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-neutral-200/50 transition hover:-translate-y-1 hover:shadow-lg scale-[0.93]"
                >
                  <div className="relative">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium text-white ${getCategoryColor(
                          post.category
                        )}`}
                      >
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-2.5 p-5">
                    <h3 className="text-sm font-semibold text-neutral-900 leading-snug group-hover:text-emerald-700 transition-colors">
                      {post.title}
                    </h3>
                    <p className="flex-1 text-[12px] leading-relaxed text-neutral-600">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-500">
                      <span>{post.author}</span>
                      <span>{post.date}</span>
                    </div>
                    <Link
                      to="/signup"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      Read More
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}