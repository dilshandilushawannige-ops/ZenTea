import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const StatsSection = () => {
  const statNumbersRef = useRef([]);

  const statsData = [
    { number: 60, label: 'million Zentea tea drinkers daily' },
    { number: 100, label: 'countries have Zentea tea available' },
    { number: 3000, label: 'Zentea products — the widest range of any tea company' },
    { number: 250000, label: 'direct community beneficiaries' },
  ];

  const addNumberRef = (el) => {
    if (el && !statNumbersRef.current.includes(el)) {
      statNumbersRef.current.push(el);
    }
  };

  useEffect(() => {
    statNumbersRef.current.forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      const obj = { val: 0 };

      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          el.innerText = Math.floor(obj.val).toLocaleString();
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <>
      {/* Top banner image with text on top */}
      <section className="relative w-full flex items-center justify-center mt-0">
        {/* Banner image with dark filter */}
        <div className="relative w-full h-[400px] md:h-[450px] mt-10 overflow-hidden">
          <img
            src="/images/Tea-leaf-teal-background.png"
            alt="Tea Banner"
            className="w-full h-full object-cover brightness-50"
          />
        </div>

        {/* Text overlay */}
        <div className="mt- 0 absolute inset-0 flex flex-col items-center justify-center space-y-4">
          <h1 className="text-white text-4xl md:text-6xl font-bold text-center px-4 drop-shadow-lg tracking-wider font-ibarra">
            MAKING A STAND
          </h1>
          <p className="text-white text-lg md:text-xl text-center px-10 max-w-2xl drop-shadow-lg font-jost">
            Our Founder, Merrill J. Fernando, made a stand for Quality, Integrity, People & Nature.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mt-12 py-12 md:py-20 px-4 bg-white">
        <div className="container mx-auto text-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {statsData.map((stat, index) => (
              <div key={index}>
                <span
                  ref={addNumberRef}
                  className="block text-4xl md:text-5xl font-bold mb-2 text-black"
                  data-target={stat.number}
                >
                  0
                </span>
                <span className="text-base md:text-lg text-gray-700">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default StatsSection;