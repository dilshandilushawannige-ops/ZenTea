import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FaFacebookF, FaTwitter, FaYoutube, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      footerRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
    );
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative text-white py-20 px-8"
      style={{
        backgroundImage: "url('images/footer-bg.jpg')", // <-- your background image here
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay (optional for readability, remove if you want pure image) */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Logo */}
        <div>
          <img src="images/ceylon-logo.png" alt="Ceylon Tea" className="w-32 mb-4" />
          <p className="text-sm">Symbol of Quality</p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-6 text-sm">
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Home</a></li>
            <li><a href="#" className="hover:underline">Story of Ceylon Tea</a></li>
            <li><a href="#" className="hover:underline">Production Process</a></li>
            <li><a href="#" className="hover:underline">Tea Diversity</a></li>
            <li><a href="#" className="hover:underline">Perfect Cup of Tea</a></li>
          </ul>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Where to Buy</a></li>
            <li><a href="#" className="hover:underline">Gallery</a></li>
            <li><a href="#" className="hover:underline">Blog</a></li>
            <li><a href="#" className="hover:underline">Contact Us</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="font-semibold mb-4">Social Media</h3>
          <div className="flex gap-4 text-xl">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaYoutube /></a>
            <a href="#"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>

      {/* Leaf Illustration - keep existing */}
      <img
        src="/leaf-illustration.png"
        alt="Tea Leaf"
        className="absolute right-8 bottom-0 w-40 opacity-90"
      />
    </footer>
  );
}
