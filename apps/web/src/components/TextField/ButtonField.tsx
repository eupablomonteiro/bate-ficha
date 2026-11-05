import React from "react";
import { Button } from "../ui/button";

interface ButtonFieldProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const ButtonField = ({ onClick, children, className }: ButtonFieldProps) => {
  return (
    <Button
      onClick={onClick}
      className="flex items-center justify-center absolute h-10 w-10 right-0 top-0 bottom-0 rounded p-1 text-zinc-200"
    >
      {children}
    </Button>
  );
};

export default ButtonField;
