import React from "react";
import { PiRankingFill } from "react-icons/pi";

const Title = () => {
  return (
    <div className="flex gap-2 items-center">
      <PiRankingFill size={32} className="text-green-700" />
      <div className="flex items-center">
        <h1 className="text-2xl font-bold">
          <span className="text-green-700">Ranking</span> dos Amigos
        </h1>
      </div>
    </div>
  );
};

export default Title;
