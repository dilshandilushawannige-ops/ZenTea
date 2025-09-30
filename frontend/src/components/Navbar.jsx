import { useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link, useLocation } from "react-router-dom";
import { User, ShoppingCart } from "lucide-react";
import { navLinks } from "../../constants/index.js";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import CartSidebar from "./CartSidebar";

gsap.registerPlugin(ScrollTrigger);

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { getTotalItems, toggleCart } = useCart();

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

  const isCustomer = !!(user && user.role?.toLowerCase().includes('customer'));

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-black/50 backdrop-blur-lg shadow-md" : "bg-transparent"
      }`}
    >
      <div className="relative mx-auto flex w-full max-w-6xl items-center px-5 sm:px-7 lg:px-9 py-4">
        <Link to="/" className="flex items-center gap-2 text-white">
          <img src="/images/logof.png" alt="logo" className="h-12 w-auto" />
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
          <div className="flex items-center gap-3">
            <Link
              to={isCustomer ? "/account" : "/login"}
              className="flex items-center gap-2 rounded-full border border-white/70 px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-black"
            >
              <User className="h-4 w-4" strokeWidth={1.8} />
              <span>Account</span>
            </Link>
            <button
              onClick={toggleCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-colors duration-200 hover:bg-[#e7e7e7]"
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={1.8} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
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
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                to={isCustomer ? "/account" : "/login"}
                onClick={closeMenu}
                className="flex flex-1 min-w-[150px] items-center justify-center gap-2 rounded-full border border-white/70 px-4 py-2 text-center font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-black"
              >
                <User className="h-4 w-4" strokeWidth={1.8} />
                <span>Account</span>
              </Link>
              <button
                onClick={() => {
                  closeMenu();
                  toggleCart();
                }}
                className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition-colors duration-200 hover:bg-[#e7e7e7]"
              >
                <ShoppingCart className="h-5 w-5" strokeWidth={1.8} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <CartSidebar />
    </nav>
  );
};

export default Navbar;
