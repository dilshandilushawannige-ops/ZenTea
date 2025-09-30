import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { signup } from "../../api/authApi";
import { onlyLetters, isPhone, strongPassword } from "../../utils/validation";
import { Link, useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [form, setForm] = useState({
    role: "Customer",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    company: "",
  });
  const [agree, setAgree] = useState(false);

  // Slideshow images
  const slides = ["/images/sign1.png", "/images/s1.png", "/images/s3.png"];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    // Change every 30 seconds (30000 ms)
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 30000);
    return () => clearInterval(t);
  }, []);
  const next = () => setIdx((i) => (i + 1) % slides.length);
  const prev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);

  const nav = useNavigate();
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!agree)
      return Swal.fire({
        icon: "warning",
        title: "Please accept Terms & Privacy",
        toast: true,
        position: "top",
      });
    if (!onlyLetters(form.name))
      return Swal.fire({
        icon: "error",
        title: "Name must contain only letters",
        toast: true,
        position: "top",
      });
    if (!isPhone(form.phone))
      return Swal.fire({
        icon: "error",
        title: "Phone must be 07XXXXXXXX or +94XXXXXXXXX",
        toast: true,
        position: "top",
      });
    if (!strongPassword(form.password)) {
      return Swal.fire({
        icon: "error",
        title: "Weak password",
        text: "Password must have 8+ chars, 1 uppercase, 1 number, 1 special char",
        toast: true,
        position: "top",
      });
    }
    if (form.password !== form.confirmPassword)
      return Swal.fire({
        icon: "error",
        title: "Passwords do not match",
        toast: true,
        position: "top",
      });

    try {
      const { data } = await signup(form);
      Swal.fire({
        icon: "success",
        title: data.message,
        toast: true,
        position: "top",
      });
      nav("/login");
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: e.response?.data?.message || "Signup failed",
        toast: true,
        position: "top",
      });
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
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-emerald-900/10 backdrop-blur-[1px]" />

      {/* Card */}
      <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white/95 rounded-2xl shadow-lg overflow-hidden ring-1 ring-black/5">
        {/* Form */}
        <div className="p-5 md:p-6 bg-white order-1 md:order-2">
          <div className="h-full flex flex-col justify-between max-w-[300px] w-full mx-auto">
            <h1 className="text-[22px] font-semibold text-black mb-2">
              Create an account
            </h1>

            <form onSubmit={submit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[14px] font-medium text-black">
                  Name
                </label>
                <input
                  name="name"
                  placeholder="First Name"
                  className="mt-1 w-full border border-neutral-300 rounded-md py-2 px-3 bg-white text-[14px] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
                  value={form.name}
                  onChange={change}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[14px] font-medium text-black">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="mt-1 w-full border border-neutral-300 rounded-md py-2 px-3 bg-white text-[14px] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
                  value={form.email}
                  onChange={change}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[14px] font-medium text-black">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="mt-1 w-full border border-neutral-300 rounded-md py-2 px-3 bg-white text-[14px] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
                  value={form.password}
                  onChange={change}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[14px] font-medium text-black">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="mt-1 w-full border border-neutral-300 rounded-md py-2 px-3 bg-white text-[14px] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
                  value={form.confirmPassword}
                  onChange={change}
                  required
                />
              </div>

              {/* Phone + Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[14px] font-medium text-black">
                    Phone
                  </label>
                  <input
                    name="phone"
                    placeholder="07XXXXXXXX"
                    className="mt-1 w-full border border-neutral-300 rounded-md py-2 px-3 bg-white text-[14px] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
                    value={form.phone}
                    onChange={change}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-black">
                    Role
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={change}
                    className="mt-1 w-full border border-neutral-300 rounded-md py-2 px-3 bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    {["Admin", "Collector", "Supplier", "Employee", "Customer"].map(
                      (r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {form.role === "Supplier" && (
                  <div className="sm:col-span-2">
                    <label className="block text-[14px] font-medium text-black">
                      Company (optional)
                    </label>
                    <input
                      name="company"
                      placeholder="Your company name"
                      className="mt-1 w-full border border-neutral-300 rounded-md py-2 px-3 bg-white text-[14px] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
                      value={form.company}
                      onChange={change}
                    />
                  </div>
                )}
              </div>

              {/* Terms checkbox */}
              <label className="flex items-center gap-2 text-[13px] text-black">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-black focus:ring-black"
                />
                I agree to the{" "}
                <a href="#" className="underline text-black">
                  Terms & Privacy
                </a>
              </label>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-2 rounded-md bg-black text-white text-[15px] font-semibold hover:bg-neutral-800"
              >
                Create
              </button>

              <p className="text-[13px] text-center text-black">
                Already have an account?{" "}
                <Link to="/login" className="underline text-black">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Slideshow */}
        <div className="relative min-h-[220px] md:min-h-[320px] order-2 md:order-1 overflow-hidden rounded-b-2xl md:rounded-b-none md:rounded-r-2xl">
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
            <div className="space-y-1.5 pl-3 md:pl-5">
              <h2 className="text-[20px] md:text-[22px] font-extrabold leading-snug max-w-sm">
                Discover Green, Black, Herbal Teas Worldwide
              </h2>
              <p className="max-w-xs text-white/90 text-[12px]">
                Join our global tea family and enjoy authentic blends delivered
                fresh to your doorstep.
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