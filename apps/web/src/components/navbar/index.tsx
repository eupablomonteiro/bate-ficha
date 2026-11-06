"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

// Context
import { useAuth } from "@/context/AuthContext";

// Components
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

// Icons
import {
  LogOut,
  Loader2,
  Menu,
  User,
  Settings,
  Plus,
  Home,
} from "lucide-react";
import { GiPodiumWinner } from "react-icons/gi";

const Navbar = () => {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsSheetOpen(false);
      setIsLoggingOut(true);
      logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = (path: string) => {
    setIsSheetOpen(false);

    if (pathname !== path) {
      router.push(path);
    }
  };

  return (
    <nav className="w-full fixed top-0 left-0 right-0 z-40 bg-zinc-950 p-4">
      <div className="container mx-auto flex flex-wrap gap-4 justify-between items-center">
        <Link href="/home" passHref className="flex items-center gap-2 text-sm">
          BateFicha
        </Link>
        <div className="flex items-center gap-2">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <button
                className="p-0 text-green-700"
                onClick={() => setIsSheetOpen(true)}
              >
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-zinc-950 text-zinc-200 p-0 border-l-2 border-zinc-800"
            >
              <SheetHeader className="flex justify-start items-start border-b-2 border-zinc-800 p-4">
                <SheetTitle className="text-green-700 text-2xl">
                  Menu
                </SheetTitle>
                <SheetDescription className="text-zinc-400 font-bold">
                  Opções de navegação
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6 px-4">
                <Link
                  href="/home"
                  className={`w-full flex items-center px-4 py-2 rounded gap-2 justify-start bg-zinc-900 text-zinc-200 font-bold ${
                    pathname === "/home" ? "opacity-30 cursor-not-allowed" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSheetOpen(false);
                    handleNavigation("/home");
                  }}
                  passHref
                >
                  <Home size={18} /> Início
                </Link>
                <Link
                  href="/profile"
                  passHref
                  className={`w-full flex items-center px-4 py-2 rounded gap-2 justify-start bg-zinc-900 text-zinc-200 font-bold ${
                    pathname === "/profile"
                      ? "opacity-30 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={(e) => {
                    if (pathname === "/profile") {
                      e.preventDefault();
                    } else {
                      setIsSheetOpen(false);
                      handleNavigation("/profile");
                    }
                  }}
                >
                  <User size={18} /> Meu Perfil
                </Link>
                <Link
                  href="/add-friends"
                  passHref
                  className={`w-full flex items-center px-4 py-2 rounded gap-2 justify-start bg-zinc-900 text-zinc-200 font-bold ${
                    pathname === "/add-friends"
                      ? "opacity-30 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={(e) => {
                    if (pathname === "/add-friends") {
                      e.preventDefault();
                    } else {
                      setIsSheetOpen(false);
                      handleNavigation("/add-friends");
                    }
                  }}
                >
                  <Plus size={18} /> Adicionar Amigos
                </Link>
                <Link
                  href="/ranking"
                  passHref
                  className={`w-full flex items-center px-4 py-2 rounded gap-2 justify-start bg-zinc-900 text-zinc-200 font-bold ${
                    pathname === "/ranking"
                      ? "opacity-30 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={(e) => {
                    if (pathname === "/ranking") {
                      e.preventDefault();
                    } else {
                      setIsSheetOpen(false);
                      handleNavigation("/ranking");
                    }
                  }}
                >
                  <GiPodiumWinner size={18} /> Ranking dos Amigos
                </Link>
                <Link
                  href="/configs"
                  passHref
                  className={`w-full flex items-center px-4 py-2 rounded gap-2 justify-start bg-zinc-900 text-zinc-200 font-bold ${
                    pathname === "/configs"
                      ? "opacity-30 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={(e) => {
                    if (pathname === "/configs") {
                      e.preventDefault();
                    } else {
                      setIsSheetOpen(false);
                      handleNavigation("/configs");
                    }
                  }}
                >
                  <Settings size={18} /> Configurações
                </Link>
                <Button
                  variant="default"
                  className="w-full justify-start border-2 bg-red-500 border-none"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <Loader2 className="animate-spin mr-2" size={18} />
                  ) : (
                    <LogOut className="mr-2" size={18} />
                  )}
                  Deslogar
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
