import React from "react";
import Image from "next/image";
import VersusSnookerIcon from "@/assets/taco-de-sinuca-versus.svg";

const Versus = ({ className }: { className?: string }) => {
  return (
    <span
      className={`flex flex-col items-center justify-center relative ${className}`}
    >
      <Image
        src={VersusSnookerIcon}
        alt="Versus Snooker Icon"
        width={38}
        height={38}
        className="opacity-50 invert"
      />
      <span className="text-green-500 font-bold text-3xl absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
        VS
      </span>
    </span>
  );
};

export default Versus;
