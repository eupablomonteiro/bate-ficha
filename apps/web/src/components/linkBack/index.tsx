import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

interface LinkBackProps {
  href: string;
  text?: string;
}

const LinkBack = ({ href, text = "Voltar" }: LinkBackProps) => {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={() => router.push(`${href}`)}
      className="w-24 h-8 bg-zinc-800 rounded-full"
    >
      <ArrowLeft size={20} /> {text}
    </Button>
  );
};

export default LinkBack;
