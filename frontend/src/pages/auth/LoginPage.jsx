import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { roleHome } from "../../utils/rolePath";
import Swal from "sweetalert2";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  // Slideshow images
  const slides = ["/images/sign1.png", "/images/sign3.png", "/images/Tea3.png"];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    // Slideshow every 30 seconds
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 30000);
    return () => clearInterval(t);
  }, []);

  const next = () => setIdx((i) => (i + 1) % slides.length);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      Swal.fire({
        icon: "success",
        title: "Login successful",
        toast: true,
        position: "top",
      });
      nav(roleHome(u.role));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: err.response?.data?.message || "Login failed",
        toast: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, rgba(0,0,0,0.15), rgba(0,0,0,0.25)), url('/images/bg1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-emerald-900/10 backdrop-blur-[1px]" />

      {/* Card */}
      <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white/95 rounded-2xl shadow-xl overflow-hidden ring-1 ring-black/5 min-h-[520px]">
        {/* Form */}
        <div className="p-6 bg-white order-1 md:order-2 flex items-center">
          <div className="w-full max-w-[320px] mx-auto flex flex-col items-center justify-center text-center h-full">
            {/* Heading */}
            <h1 className="text-[23px] font-semibold text-black mb-0">
              Welcome back!
            </h1>
            <p className="text-[12px] text-gray-500 mb-6">
              Please enter your details to continue
            </p>

            <form onSubmit={onSubmit} className="w-full text-left space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="text-[13px] font-medium text-black"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="workmail@gmail.com"
                  className="mt-1 w-full border border-neutral-300 rounded-md py-2 px-3 bg-white text-[13px] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="text-[13px] font-medium text-black"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="mt-1 w-full border border-neutral-300 rounded-md py-2 px-3 bg-white text-[13px] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-md bg-black text-white text-[14px] font-semibold hover:bg-neutral-800 transition"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              {/* Footer */}
              <p className="text-[12px] text-center text-black">
                Don’t have an account?{" "}
                <Link to="/signup" className="underline text-black">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Slideshow */}
        <div className="relative min-h-[300px] md:min-h-[520px] order-2 md:order-1 overflow-hidden rounded-b-2xl md:rounded-b-none md:rounded-r-2xl">
          {slides.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Tea slide ${i + 1}`}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                i === idx ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/35 via-emerald-700/20 to-emerald-900/35 pointer-events-none" />
          <div className="relative z-10 h-full p-4 flex flex-col justify-between text-white">
            {/* Slight padding left for balance */}
            <div className="space-y-1.5 pl-3 md:pl-5">
              <h2 className="text-[20px] md:text-[22px] font-extrabold leading-snug max-w-sm">
                Your Favorite Teas Await You Worldwide
              </h2>
              <p className="max-w-xs text-white/90 text-[13px]">
                Green, black, and herbal teas sourced globally crafted to bring
                comfort in every sip.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-1.5 w-4 rounded-full transition ${
                      i === idx ? "bg-white" : "bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={prev}
                  className="h-6 w-6 rounded-full bg-white/85 hover:bg-white text-emerald-700 font-bold"
                  aria-label="Previous slide"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  className="h-6 w-6 rounded-full bg-white/85 hover:bg-white text-emerald-700 font-bold"
                  aria-label="Next slide"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* END Slideshow */}
      </div>
    </div>
  );
}