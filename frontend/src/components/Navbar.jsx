import { useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link, useLocation } from "react-router-dom";
import { navLinks } from "../../constants/index.js";

gsap.registerPlugin(ScrollTrigger);

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(raf);
  }, [location.pathname]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-black/50 backdrop-blur-lg shadow-md" : "bg-transparent"
      }`}
    >
      <div className="relative mx-auto flex w-full max-w-6xl items-center px-5 sm:px-7 lg:px-9 py-4">
        <Link to="/" className="flex items-center gap-2 text-white">
          <img src="/images/logo.png" alt="logo" className="h-11 w-auto" />
          <span className="text-[#7ed957] font-bold text-lg">ZenTea</span>
        </Link>

        <div className="ml-auto hidden md:flex items-center gap-12">
          <ul className="flex items-center gap-10 text-white font-medium">
            {navLinks.map((link) => (
              <li key={link.id}>
                {link.path ? (
                  <Link
                    to={link.path}
                    className="hover:text-[#7ed957] transition-colors duration-200"
                  >
                    {link.title}
                  </Link>
                ) : (
                  <a
                    href={`#${link.id}`}
                    className="hover:text-[#7ed957] transition-colors duration-200"
                  >
                    {link.title}
                  </a>
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="rounded-xl border border-[#7ed957] px-5 py-2 text-sm font-semibold text-[#7ed957] transition-all duration-200 hover:bg-[#7ed957] hover:text-black"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-xl bg-[#7ed957] px-5 py-2 text-sm font-semibold text-black transition-all duration-200 hover:bg-[#5ab143]"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <button
          type="button"
          className="ml-auto md:hidden text-white"
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div
          className={`md:hidden absolute inset-x-4 top-full transition-all duration-300 ${
            menuOpen ? "pointer-events-auto opacity-100 translate-y-2" : "pointer-events-none opacity-0 -translate-y-2"
          }`}
        >
          <div className="rounded-2xl bg-black/80 px-5 py-6 backdrop-blur">
            <ul className="flex flex-col gap-3 text-white font-medium">
              {navLinks.map((link) => (
                <li key={link.id}>
                  {link.path ? (
                    <Link
                      to={link.path}
                      onClick={closeMenu}
                      className="block rounded-lg px-2 py-2 hover:bg-white/10"
                    >
                      {link.title}
                    </Link>
                  ) : (
                    <a
                      href={`#${link.id}`}
                      onClick={closeMenu}
                      className="block rounded-lg px-2 py-2 hover:bg-white/10"
                    >
                      {link.title}
                    </a>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/login"
                onClick={closeMenu}
                className="block rounded-xl border border-[#7ed957] px-4 py-2 text-center font-semibold text-[#7ed957] transition-all duration-200 hover:bg-[#7ed957] hover:text-black"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={closeMenu}
                className="block rounded-xl bg-[#7ed957] px-4 py-2 text-center font-semibold text-black transition-all duration-200 hover:bg-[#5ab143]"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
