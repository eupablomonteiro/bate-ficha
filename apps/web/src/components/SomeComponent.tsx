"use client";

import React, { useEffect, useState } from "react";
import { useCookieManager } from "@/utils/cookieManager";

const SomeComponent = () => {
  const { saveToCookies, getFromCookies, allowCookies } = useCookieManager();
  const [userPreference, setUserPreference] = useState<string>(
    getFromCookies<string>("userPreference", "default")
  );

  const savePreference = (value: string) => {
    setUserPreference(value);
    
    // Se o usuário aceitou cookies, salvar a preferência
    if (allowCookies) {
      saveToCookies("userPreference", JSON.stringify(value));
    }
  };

  return (
    <div>
      <p>Sua preferência atual: {userPreference}</p>
      <button onClick={() => savePreference("nova preferência")}>
        Mudar preferência
      </button>
      
      {!allowCookies && (
        <p className="text-yellow-500">
          Você precisa aceitar cookies nas configurações para que suas preferências 
          sejam lembradas na próxima visita.
        </p>
      )}
    </div>
  );
};

export default SomeComponent;