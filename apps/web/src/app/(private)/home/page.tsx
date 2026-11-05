"use client";

import React from "react";
import withAuth from "@/hoc/withAuth";
import Link from "next/link";

// Layout
import PrivateLayout from "@/layouts/PrivateLayout";

// Components
import HistoryMatches from "@/components/historyMatches";

// Icons
import { PlusCircle } from "lucide-react";

const HomePage = () => {
  return (
    <PrivateLayout>
      <section className="flex flex-wrap justify-between items-center mb-2 gap-4 border-b border-zinc-900 px-2 pb-4">
        <div className="container mx-auto">
          <Link
            passHref
            href="/create-match"
            className="w-full flex p-2 gap-2 items-center justify-center bg-green-700 text-zinc-200 text-md rounded-full"
          >
            <PlusCircle size={20} />
            Nova Partida
          </Link>
        </div>
      </section>
      <HistoryMatches />
    </PrivateLayout>
  );
};

export default withAuth(HomePage);
