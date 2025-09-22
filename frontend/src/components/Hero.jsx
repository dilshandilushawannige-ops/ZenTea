import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/all";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { useMediaQuery } from "react-responsive";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
    const videoRef = useRef();
    const heroRef = useRef();
    const titleRef = useRef();

    const isMobile = useMediaQuery({ maxWidth: 767 });

    useGSAP(() => {
        const heroSplit = new SplitText(".title", {
            type: "chars, words",
        });

        const paragraphSplit = new SplitText(".subtitle", {
            type: "lines",
        });

        // Apply text-gradient class once before animating
        heroSplit.chars.forEach((char) => char.classList.add("text-gradient"));

        gsap.from(heroSplit.chars, {
            yPercent: 100,
            duration: 1.8,
            ease: "expo.out",
            stagger: 0.06,
        });

        gsap.from(paragraphSplit.lines, {
            opacity: 0,
            yPercent: 100,
            duration: 1.8,
            ease: "expo.out",
            stagger: 0.06,
            delay: 1,
        });

        // ScrollTrigger animation for the title
        gsap.to(titleRef.current, {
            y: -100, // Move up by 100px
            scrollTrigger: {
                trigger: heroRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true, // Smooth scrubbing effect
            }
        });

    }, []);

    return (
        <>
            <section ref={heroRef} id="hero" className="relative min-h-screen w-full overflow-hidden">
                {/* Background video */}
                <video
                    ref={videoRef}
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="auto"
                    src="/videos/hero.mp4"
                    className="absolute inset-0 w-full h-full object-cover z-[-1]"
                />

                
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
                    <h1 ref={titleRef} className="title">ZenTea</h1>

                    <div className="content text-center mt-6">
                        <p className="subtitle text-lg md:text-2xl">Finest Ceylon Tea</p>
                        <p className="subtitle mt-4 max-w-xl">
                           Summer is one of our favourite seasons and we are bringing you a collection
                            of the finest Ceylon Tea to keep you cool and refreshed all Summer long!.
                        </p>
                        <a
                            href="#cocktails"
                            className="mt-6 inline-block font-semibold opacity-80 hover:text-yellow"
                        >
                            Shop 
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Hero;