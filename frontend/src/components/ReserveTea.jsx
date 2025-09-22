import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const ReserveTea = () => {
  const container = useRef();
  const imageRef = useRef();
  const textRef = useRef();

  useGSAP(() => {
    const imageTween = gsap.from(imageRef.current, {
      x: -100,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
      immediateRender: false,
      scrollTrigger: {
        trigger: container.current,
        start: "top 70%",
        toggleActions: "play none none none",
        once: true,
      },
    });

    const textElements = gsap.utils.toArray(
      textRef.current?.querySelectorAll(".animate-line") || []
    );

    const textTween = textElements.length
      ? gsap.from(textElements, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
            once: true,
          },
        })
      : null;

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      imageTween.scrollTrigger?.kill();
      imageTween.kill();
      if (textTween) {
        textTween.scrollTrigger?.kill();
        textTween.kill();
      }
      textElements.forEach((el) => gsap.set(el, { clearProps: "all" }));
    };
  }, { scope: container });

  return (
    <section
      ref={container}
      className="relative bg-white py-24 overflow-hidden"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-12 px-5 md:flex-row">
        <div
          ref={imageRef}
          className="w-full md:w-[45%] flex justify-center"
        >
          <img
            src="/images/teareserve.png"
            alt="85 Reserve Tea"
            className="w-full max-w-md object-contain"
          />
        </div>

        <div
          ref={textRef}
          className="reserve-text w-full md:w-[55%] text-[#202321]"
        >
          <h2 className="animate-line font-ibarra text-5xl font-bold mb-4">85 Reserve</h2>
          <p className="animate-line font-ibarra text-2xl mb-6">Small batch luxury artisanal tea</p>

          <p className="animate-line font-jost text-lg leading-relaxed text-[#303534] mb-10 max-w-[520px]">
            The finest handpicked and small batch teas celebrate 1985, the year that the world&apos;s most experienced tea maker, Merrill J. Fernando, founded Dilmah. Every Dilmah 85 Reserve Tea and Infusion has been hand selected and crafted by Merrill J. Fernando, the master tea maker himself, to bring a taste of luxury and indulgence to the everyday.
          </p>

          <button className="inline-flex items-center justify-center px-10 py-3 border border-[#cda63a] text-sm font-semibold uppercase tracking-[0.35em] text-[#1c4f4b] transition-colors hover:bg-[#cda63a] hover:text-white">
            Explore
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReserveTea;
