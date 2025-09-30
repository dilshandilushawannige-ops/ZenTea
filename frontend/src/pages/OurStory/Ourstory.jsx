import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const highlightStats = [
  {
    title: "28+ Years of Craftsmanship",
    description:
      "Family-run estates and modern factories working together to protect the character of Ceylon tea.",
    icon: "Heritage",
  },
  {
    title: "Dedicated Field Experts Worldwide",
    description:
      "82 agronomists, tasters, and supply specialists guiding growers from bud to blend every day.",
    icon: "Team",
  },
  {
    title: "Value Through Sustainability",
    description:
      "Profit sharing, replanting funds, and zero-waste packaging keep every harvest future ready.",
    icon: "Impact",
  },
];

const operationsPillars = [
  {
    label: "Fresh Leaf Logistics",
    detail:
      "GPS-tracked leaf collection routes and automated weighing ensure nothing spoils between field and factory.",
    badge: "01",
  },
  {
    label: "Precision Withering",
    detail:
      "Climate controlled troughs and IoT sensors feed a live dashboard so moisture stays in the sweet spot.",
    badge: "02",
  },
  {
    label: "Smart Rolling & Fermentation",
    detail:
      "AI assisted timers pair with artisan tastings to balance throughput with signature flavour.",
    badge: "03",
  },
  {
    label: "Green Energy Drying",
    detail:
      "Biomass-fired dryers and solar recovery systems reduce energy spend by 36 percent annually.",
    badge: "04",
  },
  {
    label: "Quality Traceability",
    detail:
      "Every lot carries a digital passport from plot to packaging for instant recall readiness.",
    badge: "05",
  },
  {
    label: "Global Fulfilment",
    detail:
      "Integrated ERP bridges estates, warehouses, and shipping partners for reliable on-time delivery.",
    badge: "06",
  },
];

const leadershipTeam = [
  {
    name: "Lena Perera",
    role: "Executive Chair Officer",
    image: "/images/p3.png",
  },
  {
    name: "Rashmi Hearth",
    role: "Chief People Officer",
    image: "/images/p4.png",
  },
  {
    name: "Amith De Silva",
    role: "Director, Global Sourcing",
    image: "/images/p1.png",
  },
  {
    name: "Jeeva Fernando",
    role: "Head of Factory Innovation",
    image: "/images/p5.png",
  },
  {
    name: "Noelle De Silva",
    role: "Chief People Officer",
    image: "/images/p2.png",
  },
];

const statIcons = {
  Heritage: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3c-4 3-6.5 6.5-6.5 10.5a6.5 6.5 0 0 0 13 0C18.5 9.5 16 6 12 3Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3v18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Team: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M6.5 20a5.5 5.5 0 0 1 11 0" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="5.5" cy="9.5" r="2.3" />
      <circle cx="18.5" cy="9.5" r="2.3" />
      <path d="M3 20c0-2.4 1.9-4.4 4.3-4.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 15.4c2.4.3 4.3 2.2 4.3 4.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Impact: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4v2" strokeLinecap="round" />
      <path d="M12 18v2" strokeLinecap="round" />
      <path d="M4 12h2" strokeLinecap="round" />
      <path d="M18 12h2" strokeLinecap="round" />
      <path d="M6.3 6.3 7.7 7.7" strokeLinecap="round" />
      <path d="M16.3 16.3 17.7 17.7" strokeLinecap="round" />
      <path d="M6.3 17.7 7.7 16.3" strokeLinecap="round" />
      <path d="M16.3 7.7 17.7 6.3" strokeLinecap="round" />
    </svg>
  ),
};

export default function OurStory() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-visible">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(7,44,35,0.92) 0%, rgba(12,78,52,0.88) 50%, rgba(13,91,58,0.85) 100%)",
            }}
          />
          <img
            src="/images/bg2.jpg"
            alt="Tea factory operations"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-5 pt-28 pb-32 text-white lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-1 text-xs uppercase tracking-[0.4em] text-emerald-100">
                Zentea Ceyloan
              </span>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Stewarding Every Leaf From Hillside Harvest to Global Cup
              </h1>
              <p className="text-sm text-white/80 sm:text-[15px]">
                ZenTea Estates unites smallholder growers, master tasters, and state of the art factories. We balance heritage with innovation so each batch carries the aroma, colour, and calm that made Ceylon tea world famous.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/contact-us"
                  className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                >
                  Let us collaborate
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl border border-white/40 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Tour our facilities
                </Link>
              </div>
            </div>

            <div className="relative w-full max-w-sm rounded-3xl bg-white/10 p-6 backdrop-blur">
              <div className="space-y-4 text-sm text-white/80">
                <p>
                  "Every harvest is more than a commodity; it is a pledge to farmers, families, and tea lovers worldwide."
                </p>
                <div className="space-y-1 text-white">
                  <p className="text-base font-semibold"> Amith De Silva</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                    Group Managing Director
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="rounded-2xl border border-white/30 px-3 py-4">
                    <p className="text-xl font-semibold text-white">24</p>
                    <p className="mt-1 text-white/70">Partner Estates</p>
                  </div>
                  <div className="rounded-2xl border border-white/30 px-3 py-4">
                    <p className="text-xl font-semibold text-white">30K</p>
                    <p className="mt-1 text-white/70">Daily Kilograms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highlight stats */}
        <section className="relative z-10 -mt-20 px-5 pb-2 sm:px-8">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {highlightStats.map((item) => (
              <article
                key={item.title}
                className="flex h-full flex-col gap-4 rounded-3xl bg-white/95 p-6 shadow-md ring-1 ring-[#2f6b38]/10 transition-all duration-300 hover:-translate-y-2 hover:ring-[#44934f]/25 hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#44934f]/12 text-[#2f6b38]">
                    {statIcons[item.icon]}
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#2f6b38]">
                      {item.icon}
                    </p>
                    <h3 className="text-base font-semibold text-[#1f3d2a]">
                      {item.title}
                    </h3>
                  </div>
                </div>
                <p className="text-[12px] leading-relaxed text-neutral-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Our Story + Mission */}
        <section className="px-5 pt-4 pb-16 sm:px-8">
          <div className="mx-auto max-w-5xl space-y-14">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <img
                src="/images/sign1.png"
                alt="Friends sharing tea"
                className="h-[360px] w-full rounded-2xl object-cover"
                loading="lazy"
              />
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-[#1f3d2a]">Our Story</h2>
                <div className="space-y-3 text-[13px] leading-relaxed text-neutral-600">
                  <p>
                   ZenTea Estates began as a hillside factory that lent trucks, tasters, and skilled technicians to neighbouring gardens. We believed exceptional tea tastes better when growers and factories move in harmony, so we coordinated every detail from field to firing.
                  </p>
                  <p>
                    Decades later, we guide a network of partner estates, energy-conscious plants, and sensory labs. Calibrated tasting panels and live dashboards preserve the colour, aroma, and body that made Ceylon tea world-renowned while scaling to modern demand.
                  </p>
                  <p>
                    Every shipment leaves Sri Lanka with a transparent story—hand-picked leaves cared for by specialists and delivered to delight tea lovers everywhere. Heritage and innovation sit side by side in every cup we ship.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-[#1f3d2a]">Our Mission</h2>
                <div className="space-y-3 text-[13px] leading-relaxed text-neutral-600">
                  <p>
                    We exist to champion growers and factory teams with fair pricing, shared technology, and purposeful welfare programmes. When every hand in the chain thrives, the tea in your cup feels honest and unforgettable.
                  </p>
                  <p>
                    Our coordinators synchronise logistics, quality checks, and compliance paperwork to keep estates, warehouses, and buyers aligned. Whether you are sourcing single-origin consignments or building private-label blends, our support is always insight-driven.
                  </p>
                  <p>
                    Together with our partners we protect the environment, celebrate craftsmanship, and deliver tea experiences that connect people everywhere. Each cup should feel like a warm welcome from the hillside communities who grow it.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <img
                  src="/images/sign2.png"
                  alt="Field experts"
                  className="h-[320px] w-full rounded-2xl object-cover"
                  loading="lazy"
                />
                <img
                  src="/images/sign3.png"
                  alt="Leaf inspection"
                  className="h-[320px] w-full rounded-2xl object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Operations pillars */}
        <section className="bg-emerald-950 px-5 py-16 text-white sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center sm:mx-auto sm:max-w-3xl">
              <p className="text-sm uppercase tracking-[0.4em] text-emerald-300">
                Factory Excellence
              </p>
              <h2 className="mt-2 text-3xl font-semibold">
                The Framework Behind Every Reliable Shipment
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-emerald-100">
                Our production teams blend artisan skill with careful automation,
                keeping flavour consistent while supporting the estates and specialists
                who craft each batch.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {operationsPillars.map((pill) => (
                <article
                  key={pill.label}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm transition hover:-translate-y-1 hover:bg-white/10"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.4em] text-emerald-300">
                    STEP {pill.badge}
                  </span>
                  <h3 className="text-lg font-semibold text-white">{pill.label}</h3>
                  <p className="text-sm leading-relaxed text-emerald-100">
                    {pill.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section className="px-5 pt-4 pb-16 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-semibold text-neutral-900">
              Board of Directors
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-neutral-600">
              Our leadership blends multigenerational tea wisdom with global supply
              chain experience. Together they guide investments in technology, welfare,
              and market expansion.
            </p>

            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
              {leadershipTeam.map((leader) => (
                <article
                  key={leader.name}
                  className="group flex flex-col items-center rounded-2xl bg-white shadow-lg ring-1 ring-gray-100 transition hover:-translate-y-2 hover:shadow-xl hover:ring-[#44934f]/30 p-6"
                >
                  {/* Avatar */}
                  <div className="relative h-28 w-28 rounded-full overflow-hidden ring-4 ring-[#44934f]/20 group-hover:ring-[#44934f]/40 transition">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-semibold text-[#1f3d2a]">
                      {leader.name}
                    </h3>
                    <p className="mt-1 inline-block rounded-full bg-[#44934f]/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#44934f]">
                      {leader.role}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-emerald-50 px-5 py-16 text-center sm:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold text-neutral-900">
              Share a Cup With Us
            </h2>
            <p className="mt-4 text-base text-neutral-600">
              Whether you are a speciality buyer, estate owner, or aspiring tea
              entrepreneur, we welcome you to experience the ZenTea production story.
              Take a guided factory tour, join a cupping lab, or explore co-branded
              offerings tailored to your market.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                to="/contact-us"
                className="rounded-xl border border-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                Say hello
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Join our community
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}