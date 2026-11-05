import React, { ReactNode } from "react";
import { CardDescription, CardHeader, CardTitle } from "../ui/card";
import { PlusCircle } from "lucide-react";

interface HeaderProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

const Header = ({ title, description, icon = <PlusCircle size={24} /> }: HeaderProps) => {
  return (
    <CardHeader className="mt-2 p-2">
      <CardTitle className="flex gap-2 items-center">
        {icon} {title}
      </CardTitle>
      <CardDescription className="text-zinc-500">{description}</CardDescription>
    </CardHeader>
  );
};

export default Header;
