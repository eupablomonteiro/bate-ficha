// Globals
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

// Api
import { fetchBestPartner } from "@/services/api";
import { getApiErrorMessage } from "@/lib/api-error";

// Components
import { BestPartnerSkeleton } from "./skeleton";

// Types and Interfaces
import { BestPartnerType } from "@/types/profile";
import { motion } from "framer-motion";
interface BestPartnerProps {
  playerId: string;
}

export const BestPartner = ({ playerId }: BestPartnerProps) => {
  const {
    data: bestPartner,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["bestPartner", playerId],
    queryFn: () => fetchBestPartner(playerId),
    staleTime: 1000 * 60 * 5,
    select: (data: BestPartnerType) => {
      if (!data?._id || !data.name || !data.nickname || !data.avatarUrl)
        return null;
      return data;
    },
  });

  if (isLoading) return <BestPartnerSkeleton />;

  if (isError) {
    return (
      <div className="w-full flex flex-col gap-4 p-4 border-t border-zinc-700">
        <h4 className="text-md text-zinc-200 font-bold">Seu melhor parceiro</h4>
        <div className="flex flex-col justify-center items-center gap-2 p-4 bg-zinc-800 rounded-md">
          <p className="text-red-500 text-center">
            {getApiErrorMessage(
              error,
              "Não foi possível carregar seu melhor parceiro."
            )}
          </p>
        </div>
      </div>
    );
  }

  if (!bestPartner)
    return (
      <div className="w-full flex flex-col gap-4 p-4 border-t border-zinc-700">
        <h4 className="text-md text-zinc-200 font-bold">Seu melhor parceiro</h4>
        <div className="flex flex-col justify-center items-center gap-2 p-4 bg-zinc-800 rounded-md">
          <p className="text-zinc-400">
            Você ainda não tem um parceiro recomendado mas fique tranquilo, você
            vai encontrar.
          </p>
        </div>
      </div>
    );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Link
        href={`/player/${bestPartner?.nickname}`}
        className="w-full flex flex-col gap-4 p-4 border-t border-zinc-700"
      >
        <h4 className="text-md text-zinc-200 font-bold">Seu melhor parceiro</h4>
        <div className="flex h-28 mt-4 relative flex-col justify-center items-center gap-2 p-2 bg-zinc-800 rounded border border-zinc-700">
          <Image
            src={bestPartner.avatarUrl}
            alt={`Avatar de ${bestPartner?.name}`}
            width={80}
            height={80}
            className="rounded-full object-cover object-center w-20 h-20 absolute -top-8"
          />
          <div className="flex flex-col items-center absolute bottom-2">
            <p className="font-bold text-zinc-200">{bestPartner?.name}</p>
            <p className="text-sm text-zinc-400">@{bestPartner?.nickname}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
