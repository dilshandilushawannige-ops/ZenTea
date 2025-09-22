import Navbar from "../../components/Navbar";
import StatsSection from "../../components/StatsSection";
import Footer from "../../components/Footer";
import React from "react";

const Ourstory = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#185519] to-[#2e7d32] py-20 px-4 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl font-bold mb-6">About ZenTea Ceylon</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Bringing the finest Ceylon tea from the lush hills of Sri Lanka to tea lovers around the world
          </p>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="flex-1 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Section */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/images/tea 4.jpg" 
                  alt="Ceylon Tea" 
                  className="w-full h-[500px] object-cover transition-transform duration-700 hover:scale-105" 
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-lg w-3/4">
                <h3 className="text-xl font-semibold text-[#185519]">Since 2005</h3>
                <p className="text-gray-600">Bringing authentic Ceylon tea to the world</p>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="bg-white rounded-2xl shadow-lg p-10">
              <h2 className="text-3xl font-bold text-[#185519] mb-6">Our Story</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Founded by passionate tea experts, ZenTea Ceylon has grown into a trusted hub for premium tea distribution. We work directly with local farmers, supporting sustainable practices and fair trade.
              </p>
              
              <h2 className="text-3xl font-bold text-[#185519] mb-6 mt-8">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                We're dedicated to ensuring every cup of tea delivers the authentic taste, aroma, and tradition that Ceylon tea is renowned for.
              </p>
              
              <div className="bg-[#f0f7f0] p-6 rounded-xl mt-8">
                <h2 className="text-2xl font-semibold text-[#185519] mb-4">What We Do</h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-[#185519] mr-2 mt-1">✓</span>
                    <span className="text-gray-700">Source and distribute high-quality Ceylon tea</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#185519] mr-2 mt-1">✓</span>
                    <span className="text-gray-700">Promote sustainable and ethical tea farming</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#185519] mr-2 mt-1">✓</span>
                    <span className="text-gray-700">Deliver to retailers, cafes, and tea enthusiasts worldwide</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#185519] mr-2 mt-1">✓</span>
                    <span className="text-gray-700">Share the culture and heritage of Ceylon tea</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Visit Us Section */}
          <div className="bg-white rounded-2xl shadow-lg p-10 mt-16 text-center">
            <h2 className="text-3xl font-bold text-[#185519] mb-6">Visit Us</h2>
            <p className="text-lg text-gray-700 mb-4">123 Tea Lane, Colombo, Sri Lanka</p>
            <p className="text-lg text-gray-700 mb-6">Email: info@zenteaceylon.com | Phone: +94 11 234 5678</p>
            <div className="mt-8 h-80 rounded-xl overflow-hidden shadow-md">
              {/* Replace with actual map component */}
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">Interactive Map Here</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <StatsSection />
      <Footer />
    </div>
  );
};

export default Ourstory;
