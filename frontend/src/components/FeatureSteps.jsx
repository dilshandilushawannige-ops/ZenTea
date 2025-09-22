import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FeatureSteps({
  features,
  className = "",
  title = "Flirt with New Tea Recipes", // Updated main heading
  autoPlayInterval = 3000,
  imageHeight = "h-[250px]", // smaller image height
})
{
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / (autoPlayInterval / 100));
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setProgress(0);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [progress, autoPlayInterval, features.length]);

  return (
    <div className={`p-8 md:p-12 ${className}`}>
      <div className="max-w-7xl mx-auto w-full">
        {/* Main heading */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-15 text-center text-green-800 font-ibarra">
          {title}
        </h2>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-10">
          {/* Steps */}
          <div className="order-2 md:order-1 space-y-8 font-jost">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex flex-col gap-2"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: index === currentFeature ? 1 : 0.3 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-6 md:gap-8">
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 ${
                      index === currentFeature
                        ? "bg-green-800 border-green-800 text-white scale-110"
                        : "bg-gray-200 border-gray-400 text-black"
                    }`}
                  >
                    {index <= currentFeature ? (
                      <span className="text-lg font-bold">✓</span>
                    ) : (
                      <span className="text-lg font-semibold">{index + 1}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-semibold">
                      {feature.title || feature.step}
                    </h3>
                    <p className="text-sm md:text-lg text-gray-600">
                      {feature.content}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-gray-200 rounded">
                  <motion.div
                    className="h-1 bg-green-800 rounded"
                    initial={{ width: 0 }}
                    animate={{
                      width: index === currentFeature ? `${progress}%` : "0%",
                    }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Images */}
          <div
            className={`order-1 md:order-2 relative overflow-hidden rounded-lg ${imageHeight} ml-20`}
          >
            <AnimatePresence mode="wait">
              {features.map(
                (feature, index) =>
                  index === currentFeature && (
                    <motion.div
                      key={index}
                      className="absolute inset-0 rounded-lg overflow-hidden"
                      initial={{ y: 100, opacity: 0, rotateX: -20 }}
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      exit={{ y: -100, opacity: 0, rotateX: 20 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <img
                        src={feature.image}
                        alt={feature.step}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center gap-2 mt-6">
          {features.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentFeature(i);
                setProgress(0);
              }}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === currentFeature ? "bg-green-800" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
