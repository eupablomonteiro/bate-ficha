import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import ClientProviders from "@/components/ClientProviders";
import RouteTransitionWrapper from "@/components/RouteTransitionWrapper";
import { UserSettingsProvider } from "@/context/UserSettingsContext";
import { AnimationProvider } from "@/context/AnimationContext";

import localFont from "next/font/local";

const uniNeue = localFont({
  src: [
    {
      path: "../fonts/UniNeueRegular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/UniNeueBold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-uni-neue",
});

export const metadata: Metadata = {
  title: "Bate-Ficha",
  description:
    "Bate-Ficha - Sistema de gerenciamento de jogos de sinuca",
  icons: {
    icon: { url: "/favicon.ico", sizes: "96x96" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${uniNeue.className} bg-zinc-950 h-dvh`}>
        <AuthProvider>
          <AnimationProvider>
            <ClientProviders>
              <UserSettingsProvider>
                <RouteTransitionWrapper>
                  <main>{children}</main>
                  <Toaster />
                </RouteTransitionWrapper>
              </UserSettingsProvider>
            </ClientProviders>
          </AnimationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
