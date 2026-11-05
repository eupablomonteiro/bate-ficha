"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAnimation } from "@/context/AnimationContext";

const LoadingScreen = () => {
  const { settings } = useAnimation();

  const lines = [
    { offsetX: -100, offsetY: 0 },
    { offsetX: -150, offsetY: 50 },
    { offsetX: -200, offsetY: 100 },
  ];

  const balls = [
    { number: 1, color: "bg-yellow-500", size: "w-8 h-8" },
    { number: 2, color: "bg-blue-500", size: "w-8 h-8" },
    { number: 3, color: "bg-red-500", size: "w-8 h-8" },
    { number: 4, color: "bg-purple-500", size: "w-8 h-8" },
    { number: 5, color: "bg-orange-500", size: "w-8 h-8" },
    { number: 6, color: "bg-green-500", size: "w-8 h-8" },
    { number: 7, color: "bg-pink-500", size: "w-8 h-8" },
    { number: 8, color: "bg-black", size: "w-8 h-8" },
    { number: 9, color: "bg-yellow-500", size: "w-8 h-8" },
    { number: 10, color: "bg-blue-500", size: "w-8 h-8" },
    { number: 11, color: "bg-red-500", size: "w-8 h-8" },
    { number: 12, color: "bg-purple-500", size: "w-8 h-8" },
    { number: 13, color: "bg-orange-500", size: "w-8 h-8" },
    { number: 14, color: "bg-green-500", size: "w-8 h-8" },
    { number: 15, color: "bg-pink-500", size: "w-8 h-8" },
  ];

  return (
    <div className="fixed inset-0 bg-green-900 flex flex-col items-center justify-center z-50 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <motion.p
          className="text-2xl font-bold text-zinc-200 z-55 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1, delay: 0 }}
        >
          Preparando a mesa...
        </motion.p>
      </div>

      <div className="relative w-full h-full z-40">
        {lines.map((line, lineIndex) => (
          <React.Fragment key={lineIndex}>
            {balls.map((ball, ballIndex) => (
              <motion.div
                key={`${lineIndex}-${ballIndex}`}
                className={`${ball.size} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${ball.color}`}
                initial={{
                  x: line.offsetX - ballIndex * 200,
                  y: line.offsetY + ballIndex * 200,
                  rotate: 0,
                }}
                animate={{
                  x: [
                    line.offsetX - ballIndex * 200,
                    360 + Math.abs(line.offsetX),
                  ],
                  y: [line.offsetY + ballIndex * 200, -Math.abs(line.offsetY)],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 0.3 + lineIndex * 0.5 + ballIndex * 0.1,
                  ease: "linear",
                  repeat: Infinity,
                  delay: 0,
                }}
              >
                {ball.number}
              </motion.div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
