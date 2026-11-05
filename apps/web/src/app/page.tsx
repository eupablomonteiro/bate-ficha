"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NextShotWinsLogo from "@/assets/next-shot-wins-removebg-preview.png";
import { useAuth } from "@/context/AuthContext";

// Components
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LoadingScreen from "@/components/loadingScreen";
import Login from "@/components/login";
import Register from "@/components/register";

const InitialPage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    setIsTransitioning(true);

    const timer = setTimeout(() => {
      setIsTransitioning(false);
      router.push("/home");
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex flex-col justify-center items-center gap-10 h-screen px-4 bg-zinc-900">
      <div className="flex flex-col items-center justify-center">
        <Image
          src={NextShotWinsLogo}
          alt="Next Shot Wins Logo"
          width={100}
          height={100}
          className="w-[128px] h-[52px]"
        />
      </div>
      <Tabs defaultValue="login" className="w-full max-w-[720px]">
        <TabsList className="grid w-full grid-cols-2 gap-1 bg-zinc-800 rounded-full">
          <TabsTrigger
            value="login"
            className="data-[state=active]:bg-green-700 data-[state=active]:text-zinc-200 font-bold rounded-full bg-zinc-700 text-zinc-500"
          >
            Login
          </TabsTrigger>
          <TabsTrigger
            value="register"
            className="data-[state=active]:bg-green-700 data-[state=active]:text-zinc-300 font-bold rounded-full bg-zinc-700 text-zinc-500"
          >
            Cadastro
          </TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Login />
        </TabsContent>
        <TabsContent value="register">
          <Register />
        </TabsContent>
      </Tabs>
      {isTransitioning && <LoadingScreen />}
    </div>
  );
};

export default InitialPage;
