"use client";

import { SimplePlayer } from "@/types/match";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface FinalizerSelectionProps {
  players: SimplePlayer[];
  register: UseFormRegister<any>;
  errors: FieldErrors;
  getShortName: (name: string) => string;
  defaultValue?: string;
}

export const FinalizerSelection = ({
  players,
  register,
  errors,
  getShortName,
  defaultValue,
}: FinalizerSelectionProps) => {
  return (
    <div>
      <label
        htmlFor="finalizer"
        className="block text-sm font-medium text-zinc-200 mb-2"
      >
        Finalizador
      </label>
      <Select
        defaultValue={defaultValue}
        onValueChange={(value) => {
          register("finalizer").onChange({ target: { value, name: "finalizer" } });
        }}
      >
        <SelectTrigger className="w-full bg-zinc-800 text-zinc-200 border-none focus:outline-none focus:ring-0">
          <SelectValue placeholder="Selecione o finalizador" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-800 border-none text-zinc-200">
          {players.map((player) => (
            <SelectItem
              key={player._id}
              value={player._id}
              className="hover:bg-transparent focus:bg-transparent"
            >
              {getShortName(player.name)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.finalizer && (
        <p className="text-red-500 text-sm mt-1">
          {errors.finalizer.message as string}
        </p>
      )}
    </div>
  );
}; 