// Globals
import Image from "next/image";

// Components
import { Button } from "@/components/ui/button";
import { HeaderSkeleton } from "./skeleton";

// Icons
import { UserRoundPen } from "lucide-react";

// Hooks
import useStringUtils from "@/hooks/useStringUtils";

// Animation
import { motion } from "framer-motion"

// Types - Interfaces
import { Player } from "@/types/auth";
interface PlayerHeaderProps {
  player: Player;
  isLoading: boolean;
  onEditProfile?: () => void;
}

export const PlayerHeader = ({
  player,
  isLoading,
  onEditProfile,
}: PlayerHeaderProps) => {
  const { getShortName, limitNickname } = useStringUtils();

  if (isLoading) return <HeaderSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full flex flex-col gap-2 py-2 px-4 border-b border-zinc-700"
    >
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <div className="flex gap-2">
          <Image
            src={player?.avatarUrl}
            alt="Avatar"
            width={64}
            height={64}
            className="rounded-full w-16 h-16 object-cover object-center"
          />
          <div className="flex flex-col">
            <h1 className="text-md font-bold text-zinc-100">
              {getShortName(player?.name)}
            </h1>
            <p className="text-sm text-zinc-400">
              @{limitNickname(player?.nickname)}
            </p>
          </div>
        </div>
        {onEditProfile && (
          <Button
            onClick={onEditProfile}
            className="bg-zinc-200 text-zinc-900 font-bold px-4 w-18 h-8 rounded-full"
          >
            <UserRoundPen size={18} />
            Editar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-[1fr_1fr_1fr] gap-4">
        <div className="flex gap-2 text-zinc-200 justify-center">
          <span className="text-zinc-400">Partidas</span>
          <p className="font-bold">
            {player?.totalMatchesSolo + player?.totalMatchesTeam}
          </p>
        </div>
        <div className="flex gap-2 text-zinc-200 justify-center">
          <span className="text-zinc-400">Seguindo</span>
          <p className="font-bold">{player?.following.length}</p>
        </div>
        <div className="flex gap-2 text-zinc-200 justify-center">
          <span className="text-zinc-400">Seguidores</span>
          <p className="font-bold">{player?.followers.length}</p>
        </div>
      </div>
    </motion.div>
  );
};
