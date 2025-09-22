import React, { useState } from "react";

/* ========= COMPACT SIZING + OVERLAP CONTROL ========= */
const S = {
   wrap: "max-w-[57rem] mx-auto px-3",  // ~960px wide

  // Banner
  bannerHeight: "h-[18rem] md:h-[22rem] lg:h-[24rem]",
  bannerTitle: "text-3xl md:text-4xl font-extrabold tracking-tight",
  bannerSubtitle: "text-xs md:text-sm",
  bannerPill: "text-xs px-4 py-2",

  // Card (form + right)
  cardPad: "p-4 md:p-5",
  inputPad: "p-2.5",
  messageH: "h-28 md:h-36",

  // Help band
  helpPadY: "py-14 md:py-20",
  helpBottomExtra: "pb-28 md:pb-36",

  // Offices
  officeOverlap: "-mt-20 md:-mt-28",
  officeTopGap: "pt-6 md:pt-8",
  mapMinH: "min-h-[16rem] md:min-h-[18rem]",
};

const CONFIG = {
  colors: {
    brand: "#56d85c",
    brandHover: "#44934f",
    cardShadow: "0 10px 24px rgba(0,0,0,0.08)",
  },
  buttons: {
    submit: "#20952CFF",
    submitHover: "#197a23",
  },
  banner: {
    pill: "WRITE TO US",
    title: "Get In Touch",
    subtitle:
      "From estate operations to export logistics, our team is here to help you move tea from field to cup.",
    gradientFrom: "#56d85c",
    gradientTo: "#44934f",
    image: "/images/ds.jpg",
    overlay: "rgba(0,0,0,0.35)",
  },
  imagery: { rightPanel: "/images/cs3.png" },
  contact: {
    email: "info@zenteaceylon.com",
    phone: "+94 55 500 4555",
    address: "23/A, Rockhill Road, Badulla, Sri Lanka",
    hours: "Mon–Sat, 9:00–17:00 (UTC+5:30)",
  },
  social: {
    items: [
      { href: "#", img: "/images/facebook.png", label: "Facebook" },
      { href: "#", img: "/images/instergram.png", label: "Instagram" },
      { href: "#", img: "/images/linkdin.png", label: "LinkedIn" },
    ],
  },
  offices: [
    {
      name: "Wewessa Tea Estate | Passara",
      lines: ["23B, Passara, Uva Province, Sri Lanka", "Light, floral teas with a unique aroma"],
      phone: "+94 55 562-0856",
      email: "uva@zenteaceylon.com",
      map:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d19801.457!2d-118.501!3d34.014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2a4cd18b07f5f%3A0x3a9c83a0e7e4b3c6!2sSanta%20Monica%2C%20CA!5e0!3m2!1sen!2sus!4v1700000000001",
    },
    {
      name: "Central Tea Estate | Bandarawela",
      lines: ["104, Bandarawela, Uva Province, Sri Lanka", "Strong, full-bodied teas with deep color"],
      phone: "+94 55 620-0856",
      email: "central@zenteaceylon.com",
      map:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.999!2d151.2093!3d-33.8688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12ae5d8b2f5d2f%3A0x5017d681632ce50!2sSydney%20NSW!5e0!3m2!1sen!2sau!4v1700000000002",
    },
  ],
};

/* ----- tiny inline contact icons ----- */
const baseIcon = (p) => ({ width: 16, height: 16, fill: "none", stroke: "currentColor", strokeWidth: 2, ...p });
const MailIcon  = (p) => (<svg {...baseIcon(p)} viewBox="0 0 24 24"><path d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z"/><path d="m22 8-10 6L2 8"/></svg>);
const PhoneIcon = (p) => (<svg {...baseIcon(p)} viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4 2 2 0 014 2h3a2 2 0 012 1.7 13 13 0 00.7 2.8 2 2 0 01-.5 2.1L8 9a16 16 0 007 7l.4-.3a2 2 0 012.1-.4 13 13 0 002.8.7A2 2 0 0122 16.9z"/></svg>);
const MapPinIcon= (p) => (<svg {...baseIcon(p)} viewBox="0 0 24 24"><path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1118 0Z"/><circle cx="12" cy="10" r="3"/></svg>);
const ClockIcon  = (p) => (<svg {...baseIcon(p)} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>);
const BoltIcon   = (p) => (<svg {...baseIcon(p)} viewBox="0 0 24 24"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>);
const HeadsetIcon= (p) => (<svg {...baseIcon(p)} viewBox="0 0 24 24"><path d="M3 12a9 9 0 0118 0v6a2 2 0 01-2 2h-3v-6h5"/><path d="M6 20H5a2 2 0 01-2-2v-6"/></svg>);

/* ======= Social Rail ======= */
function SocialRail({ className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-2.5 ${className}`}>
      {CONFIG.social.items.map((it) => (
        <a
          key={it.label}
          href={it.href || "#"}
          aria-label={it.label}
          className="w-8 h-8 rounded-full grid place-items-center shadow-md hover:opacity-90 transition"
          style={{ backgroundColor: CONFIG.colors.brand }}
        >
          <span
            aria-hidden
            className="block w-4 h-4 bg-white"
            style={{
              WebkitMaskImage: `url(${it.img})`,
              maskImage: `url(${it.img})`,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
            }}
          />
        </a>
      ))}
    </div>
  );
}

/* ----- Top Banner ----- */
function ContactBanner() {
  return (
    <div className={`relative z-0 w-full ${S.bannerHeight} flex items-center justify-center text-center`}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${CONFIG.banner.gradientFrom}, ${CONFIG.banner.gradientTo})` }} />
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url(${CONFIG.banner.image})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0" style={{ background: CONFIG.banner.overlay }} />
      <div className="relative z-10 px-3">
        <span className={`inline-block ${S.bannerPill} rounded-full bg-white/95 text-gray-900 font-semibold shadow ring-1 ring-white/70 mb-2`}>
          {CONFIG.banner.pill}
        </span>
        <h1 className={`${S.bannerTitle} text-white`}>{CONFIG.banner.title}</h1>
        <p className={`${S.bannerSubtitle} text-white/90 mt-2 max-w-xl mx-auto`}>{CONFIG.banner.subtitle}</p>
      </div>
    </div>
  );
}

/* ----- Help Band ----- */
function SupportBand() {
  const bg = "/images/ds.jpg";
  const Card = ({ icon, title, children }) => (
    <div className="bg-white/95 rounded-2xl shadow-sm ring-1 ring-white/60 p-3.5 flex items-start gap-2.5">
      <span style={{ color: CONFIG.colors.brand }}>{icon}</span>
      <div>
        <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
        <p className="text-gray-600 text-xs mt-0.5">{children}</p>
      </div>
    </div>
  );

  return (
    <section className="relative isolate w-full py-14 md:py-20 pb-28 md:pb-36">
      <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${CONFIG.colors.brand}, ${CONFIG.colors.brandHover})` }} />
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0 bg-black/30" />

      <div className={`${S.wrap} relative z-10 text-center`}>
        <h2 className="text-white text-2xl md:text-3xl font-extrabold">We're Here to Help</h2>
        <p className="text-white/90 mt-2 max-w-2xl mx-auto text-sm md:text-base">
          Whether it's estate operations or shipments, our specialists respond fast and keep your tea moving.
        </p>

        <div className="mt-6 grid sm:grid-cols-3 gap-6 text-left">
          <Card icon={<ClockIcon />} title="Response Time">We reply within 24 hours on business days.</Card>
          <Card icon={<HeadsetIcon />} title="Office Hours">{CONFIG.contact.hours}. Urgent calls get priority.</Card>
          <Card icon={<BoltIcon />} title="Priority Support">Order, billing, or export blockers — same-day attention.</Card>
        </div>
      </div>
    </section>
  );
}

/* ----- Offices + Map ----- */
function OfficeAddresses() {
  const [active, setActive] = useState(0);
  const office = CONFIG.offices[active];

  return (
    <section className={`${S.wrap} -mt-20 md:-mt-28 relative z-20 pt-6 md:pt-8 mb-12`}>
      <div className="grid md:grid-cols-2 gap-4 items-stretch">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 h-full flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Tea Estates</h3>
          {CONFIG.offices.map((o, idx) => (
            <div key={o.name} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between">
                <h4 className="text-gray-900 font-semibold text-sm">{o.name}</h4>
                <button
                  onClick={() => setActive(idx)}
                  className="text-xs transition"
                  style={{
                    color: active === idx ? CONFIG.colors.brand : "#6b7280",
                    fontWeight: active === idx ? 600 : 400,
                  }}
                >
                  Show on map
                </button>
              </div>
              <ul className="mt-1.5 text-gray-700 text-xs list-disc pl-4 leading-relaxed">
                {o.lines.map((line) => <li key={line}>{line}</li>)}
                <li>{o.phone}</li>
                <li>{o.email}</li>
              </ul>
            </div>
          ))}
        </div>

        <div className="relative h-full min-h-[14rem] md:min-h-[16rem] rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white">
          <iframe
            key={office.name}
            title={office.name}
            src={office.map}
            className="absolute inset-0 w-full h-full block"
            style={{ border: 0, display: "block" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

/* ----- Page ----- */
export default function ContactUs() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", message: "" });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatus({ type: "success", msg: "Thanks! We’ll get back to you shortly." });
      setForm({ firstName: "", lastName: "", email: "", message: "" });
    } catch {
      setStatus({ type: "error", msg: "Something went wrong. Please try again." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ContactBanner />

      <div className={`relative z-20 ${S.wrap} -mt-16 md:-mt-20`}>
        <div className="relative inline-block w-full">
          <div
            className={`bg-white rounded-2xl ${S.cardPad} grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-stretch`}
            style={{ boxShadow: CONFIG.colors.cardShadow }}
          >
            <div className="flex flex-col gap-3 self-stretch">
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div>
                  <h2 className="text-lg font-semibold mb-0.5 text-gray-900">Let's Talk!</h2>
                  <p className="text-gray-600 text-xs">
                    Get in touch using the enquiry form or contact details on the right.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-700">First Name</span>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      type="text"
                      placeholder="e.g., Dilusha"
                      autoComplete="given-name"
                      className={`border border-gray-300 rounded-lg ${S.inputPad} focus:ring-2 outline-none text-sm placeholder-gray-400 text-gray-900`}
                      style={{ outlineColor: CONFIG.colors.brand }}
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-700">Last Name</span>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      type="text"
                      placeholder="e.g., Perera"
                      autoComplete="family-name"
                      className={`border border-gray-300 rounded-lg ${S.inputPad} focus:ring-2 outline-none text-sm placeholder-gray-400 text-gray-900`}
                      style={{ outlineColor: CONFIG.colors.brand }}
                      required
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-xs text-gray-700">Email</span>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="hello@example.com"
                    autoComplete="email"
                    className={`border border-gray-300 rounded-lg ${S.inputPad} focus:ring-2 outline-none text-sm placeholder-gray-400 text-gray-900`}
                    style={{ outlineColor: CONFIG.colors.brand }}
                    required
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs text-gray-700">Message</span>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="How can we help? Include order #, estate/batch, or topic…"
                    className={`border border-gray-300 rounded-lg p-3 ${S.messageH} resize-none focus:ring-2 outline-none text-sm placeholder-gray-400 text-gray-900`}
                    style={{ outlineColor: CONFIG.colors.brand }}
                    required
                  />
                </label>

                <p className="text-[11px] text-gray-500 -mt-0.5">
                  We’ll use your details only to respond to your enquiry and keep your information confidential in line with our privacy practices.
                </p>

                <button
                  type="submit"
                  className="rounded-lg py-2.5 text-sm font-semibold text-white transition shadow-sm"
                  style={{ backgroundColor: CONFIG.buttons.submit }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = CONFIG.buttons.submitHover)}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = CONFIG.buttons.submit)}
                >
                  Submit
                </button>

                {status && (
                  <div className={`text-xs mt-1 ${status.type === "success" ? "text-green-600" : "text-red-600"}`}>
                    {status.msg}
                  </div>
                )}
              </form>

              <div className="border border-gray-200 rounded-2xl p-3 shadow-sm text-gray-700">
                <h3 className="font-semibold text-sm mb-2">Quick Contact</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span style={{ color: CONFIG.colors.brand }}><MailIcon /></span>
                    <p><span className="font-medium">Email:</span> {CONFIG.contact.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: CONFIG.colors.brand }}><PhoneIcon /></span>
                    <p><span className="font-medium">Phone:</span> {CONFIG.contact.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: CONFIG.colors.brand }}><MapPinIcon /></span>
                    <p><span className="font-medium">Address:</span> {CONFIG.contact.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl shadow-sm overflow-hidden bg-gray-100 self-stretch">
              <img
                src={CONFIG.imagery.rightPanel}
                alt="Contact visual"
                className="w-full h-full min-h-[12rem] object-cover object-center"
              />
            </div>
          </div>

          <SocialRail className="hidden md:flex absolute -right-12 bottom-0" />
        </div>

        <div className="pb-4 md:pb-6" />

        <div className="mt-2 flex md:hidden justify-center gap-3">
          <SocialRail className="!flex !flex-row !items-center !gap-3 static" />
        </div>

        <p className="text-[11px] text-gray-500 mt-2 text-center">
          ROI7 Presenter, a project of ROIFORCIO GmbH, is committed to protecting and respecting your privacy.


          
        </p>
      </div>

      <SupportBand />
      <OfficeAddresses />
      
    </div>
  );
}
