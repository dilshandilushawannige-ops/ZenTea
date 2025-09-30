import gsap from 'gsap';
import { ScrollTrigger, SplitText} from "gsap/all";
import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ReserveTea from "../components/ReserveTea";
import StatsSection from "../components/StatsSection";
import HerbalWonderSection from '../components/HerbalWonderSection';

import Footer from "../components/Footer";


const features = [
    {
        step: "Step 1",
        title: "Choose Your Tea",
        content: "Indulge in a dessert-inspired favorite. This blend features a robust black tea base with real cacao bits for a rich, chocolatey flavor that's perfectly sweet and satisfyingâ€”like your favorite treat in a cup.",
        image: "/images/Tea1.png",
    },
    {
        step: "Step 2",
        title: "Brew the Tea",
        content: "A timeless and refreshing classic. We expertly balance brisk, cold-brewed tea with the bright, tangy sweetness of lemonade. It's the ultimate thirst-quencher for a sunny day.",
        image: "/images/Tea2.png",
    },
    {
        step: "Step 3",
        title: "Enjoy Your Tea",
        content: "Escape to the tropics with this sunny, fruit-forward tea. Juicy pineapple pieces mingle with a light tea base, creating a sweet, vibrant, and perfectly refreshing sip that's pure sunshine.",
        image: "/images/Tea3.png",
    },
];

gsap.registerPlugin(ScrollTrigger, SplitText);

const Home = () => {
  return (
    <div className="homepage min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <ReserveTea />
      <StatsSection />
      <HerbalWonderSection />
      <Footer />
    </div>
  );
};

export default Home;

