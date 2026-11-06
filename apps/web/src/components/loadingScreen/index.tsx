"use client";

import React, { useMemo } from "react";

const BALL_COUNT = 15;

const BALLS = [
  { number: 1, color: "bg-yellow-500" },
  { number: 2, color: "bg-blue-500" },
  { number: 3, color: "bg-red-500" },
  { number: 4, color: "bg-purple-500" },
  { number: 5, color: "bg-orange-500" },
  { number: 6, color: "bg-green-500" },
  { number: 7, color: "bg-pink-500" },
  { number: 8, color: "bg-black" },
  { number: 9, color: "bg-yellow-500" },
  { number: 10, color: "bg-blue-500" },
  { number: 11, color: "bg-red-500" },
  { number: 12, color: "bg-purple-500" },
  { number: 13, color: "bg-orange-500" },
  { number: 14, color: "bg-green-500" },
  { number: 15, color: "bg-pink-500" },
];

const randomRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

const randomFromTo = () => {
  const fromLeft = Math.random() < 0.5;
  return {
    fromX: fromLeft ? randomRange(-250, -50) : randomRange(105, 250),
    fromY: randomRange(0, 100),
    toX: fromLeft ? randomRange(105, 250) : randomRange(-250, -50),
    toY: randomRange(0, 100),
    duration: randomRange(0.6, 2.0),
  };
};

const LoadingScreen = () => {
  const trajectories = useMemo(
    () =>
      Array.from({ length: BALL_COUNT }, () => {
        const { fromX, fromY, toX, toY, duration } = randomFromTo();
        return {
          "--from-x": `${fromX}vw`,
          "--from-y": `${fromY}vh`,
          "--to-x": `${toX}vw`,
          "--to-y": `${toY}vh`,
          "--duration": `${duration}s`,
        };
      }),
    []
  );

  return (
    <div className="fixed inset-0 bg-green-900 flex flex-col items-center justify-center z-50 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <p className="text-2xl font-bold text-zinc-200 z-55 flex items-center justify-center">
          Preparando a mesa...
        </p>
      </div>

      <div className="relative w-full h-full z-40">
        {trajectories.map((style, index) => {
          const ball = BALLS[index];
          return (
            <div
              key={index}
              className={`loading-ball absolute left-1/2 top-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${ball.color}`}
              style={style as React.CSSProperties}
            >
              {ball.number}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LoadingScreen;
