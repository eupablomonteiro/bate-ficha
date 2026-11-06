import { ReactNode } from "react";
import Navbar from "@/components/navbar";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto min-h-screen bg-zinc-950 text-zinc-200">
      <Navbar />
      <section className="mt-[58.8px] py-4">{children}</section>
    </div>
  );
}
