import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Mail, Phone, MapPin } from "lucide-react"; //  add icons

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);

  const change = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      setStatus({ ok: true, msg: "Thanks! We’ll get back to you soon." });
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus({ ok: false, msg: "Something went wrong. Please try again." });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero header */}
      <section className="relative isolate overflow-visible">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,55,35,0.94) 0%, rgba(20,80,50,0.92) 50%, rgba(25,100,65,0.9) 100%)",
          }}
        />
        <img
          src="/images/b8.jpg"
          alt="Tea estates"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-4 px-5 pt-36 pb-40 text-white text-center">
          <span className="inline-flex items-center justify-center gap-2 self-center rounded-full border border-white/30 px-4 py-1 text-xs uppercase tracking-[0.4em] text-emerald-100">
            Contact Us
          </span>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            We’d Love to Hear From You
          </h1>
          <p className="text-sm text-white/80 sm:text-[15px] max-w-2xl self-center">
            Have questions about our teas, services, or partnerships? Reach out
            and our team will get back to you quickly.
          </p>
        </div>
      </section>

      {/* Cards Section */}
      <section className="relative w-full -mt-18 md:-mt-20">
        <div className="max-w-6xl mx-auto px-4 pb-14">
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Left: Form */}
            <div className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-5 md:p-6">
              <div className="mb-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  Contact us
                </h2>
                <p className="text-sm text-gray-600">
                  Our team will get back to you within one business day.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-black">
                    Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={change}
                    placeholder="Your full name"
                    className="mt-1 w-full border border-neutral-300 rounded-md py-2 px-3 bg-white text-[13px] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#44934f]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-black">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={change}
                    placeholder="you@example.com"
                    className="mt-1 w-full border border-neutral-300 rounded-md py-2 px-3 bg-white text-[13px] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#44934f]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-black">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={change}
                    placeholder="How can we help?"
                    className="mt-1 w-full border border-neutral-300 rounded-md py-2 px-3 h-32 text-[13px] placeholder-neutral-400 resize-y focus:outline-none focus:ring-2 focus:ring-[#44934f]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-md text-white text-[14px] font-semibold transition"
                  style={{ backgroundColor: "#355b46" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#3b8045")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#44934f")
                  }
                >
                  Send message
                </button>
                {status && (
                  <p
                    className={`text-[12px] mt-1 ${
                      status.ok ? "text-emerald-700" : "text-red-600"
                    }`}
                  >
                    {status.msg}
                  </p>
                )}
              </form>
            </div>

            {/* Right: Info Panel */}
            <div className="relative rounded-2xl overflow-hidden 
              ring-1 ring-[#44934f]/25 
              bg-gradient-to-br from-[#0f3723]/95 via-[#145034]/90 to-[#166c41]/95 
              text-white shadow-lg">
              <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/10 pointer-events-none" />

              <div className="relative h-full p-5 md:p-6 flex flex-col gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <img
                      src="/images/logo.png"
                      alt="Logo"
                      className="h-7 w-auto"
                    />
                    <span className="text-sm font-semibold tracking-wide">
                      Zen Tea Ceylon
                    </span>
                  </div>
                  <p className="text-white/80 text-[13px] mt-1 max-w-sm">
                    Let’s talk tea, operations, or partnerships. Our team is
                    ready to help.
                  </p>
                </div>

                {/* Contact Info with icons */}
                <div className="grid grid-cols-1 gap-3 text-[13px]">
                  <div className="flex items-start gap-3 bg-white/10 border border-white/20 rounded-lg p-3 shadow-sm">
                    <Mail className="h-5 w-5 text-emerald-300" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a
                        href="mailto:info@zenteaceylon.com"
                        className="text-white/80 hover:text-white"
                      >
                        info@zenteaceylon.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/10 border border-white/20 rounded-lg p-3 shadow-sm">
                    <Phone className="h-5 w-5 text-emerald-300" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a
                        href="tel:+94555004555"
                        className="text-white/80 hover:text-white"
                      >
                        +94 55 500 4555
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/10 border border-white/20 rounded-lg p-3 shadow-sm">
                    <MapPin className="h-5 w-5 text-emerald-300" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-white/80">
                        23/A, Rockhill Road, Badulla, Sri Lanka
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="rounded-lg overflow-hidden ring-1 ring-white/20 bg-white/10">
                    <iframe
                      title="Map"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d19801.457!2d-118.501!3d34.014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2a4cd18b07f5f%3A0x3a9c83a0e7e4b3c6!2sSanta%20Monica%2C%20CA!5e0!3m2!1sen!2sus!4v1700000000001"
                      className="w-full h-40 md:h-48"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* End Right Panel */}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}