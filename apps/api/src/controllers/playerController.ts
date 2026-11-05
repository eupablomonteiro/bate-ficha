import cloudinary from "../config/cloudinary";
import Player, { PlayerDocument } from "../models/Player";
import { Request, Response } from "express";
import { createError } from "../utils/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { Match } from "../models";
import mongoose from "mongoose";

// Interface
interface PopulatedPlayer {
  _id: mongoose.Types.ObjectId;
  name: string;
  nickname: string;
  avatarUrl: string;
}

export const searchPlayers = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { query } = req.query;
    const loggedInPlayerId = req.player?._id;

    // converte o query para lowercase
    const convertedQueryToLowercase = query?.toString().toLowerCase();

    // Verifica se o jogador está autenticado
    if (!loggedInPlayerId) {
      return res
        .status(401)
        .json(createError("Unauthorized", "Usuário não autenticado."));
    }

    if (
      !convertedQueryToLowercase ||
      typeof convertedQueryToLowercase !== "string" ||
      convertedQueryToLowercase.trim().length < 2
    ) {
      return res
        .status(400)
        .json(createError("InvalidQuery", "Query de busca inválida."));
    }

    const searchQuery = convertedQueryToLowercase.trim();

    // Busca os jogadores
    const players = await Player.find({
      $or: [
        { nickname: { $regex: searchQuery, $options: "i" } },
        { name: { $regex: searchQuery, $options: "i" } },
      ],
    }).select("name nickname avatarUrl followers following");

    const playersWithStatus = players.map((player: PlayerDocument) => {
      const isFollowing = player.followers.some(
        (followerId) => followerId.toString() === loggedInPlayerId?.toString()
      );
      const followsMe = player.following.some(
        (followingId) => followingId.toString() === loggedInPlayerId?.toString()
      );

      return {
        _id: player._id,
        name: player.name,
        nickname: player.nickname,
        avatarUrl: player.avatarUrl,
        isFollowing,
        followsMe,
      };
    });

    res.status(200).json(playersWithStatus);
  } catch (error) {
    console.error("Erro ao buscar jogadores:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao buscar jogadores."));
  }
};

export const getPlayerByNickname = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { nickname } = req.params;
    const loggedInPlayerId = req.player?._id;

    const player = await Player.findOne({ nickname }).select(
      "name nickname avatarUrl followers following totalMatches soloWins soloLosses teamWins teamLosses partners pointsSolo pointsTeam totalMatchesSolo totalMatchesTeam"
    );

    if (!player) {
      res
        .status(404)
        .json(createError("PlayerNotFound", "Jogador não encontrado."));
      return;
    }

    const isFollowing = loggedInPlayerId
      ? player.followers.some(
          (followerId) =>
            followerId.toString() === loggedInPlayerId.toString()
        )
      : false;

    const followsMe = loggedInPlayerId
      ? player.following.some(
          (followingId) =>
            followingId.toString() === loggedInPlayerId.toString()
        )
      : false;

    res.status(200).json({
      ...player.toObject(),
      isFollowing,
      followsMe,
    });
  } catch (error) {
    console.error("Erro ao buscar jogador pelo apelido:", error);
    res
      .status(500)
      .json(
        createError("ServerError", "Erro ao buscar jogador pelo apelido.")
      );
  }
};

export const getPlayerById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const loggedInPlayerId = req.player?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res
        .status(400)
        .json(createError("InvalidId", "ID de jogador inválido."));
      return;
    }

    const player = await Player.findById(id).select(
      "name nickname avatarUrl followers following totalMatches soloWins soloLosses teamWins teamLosses partners pointsSolo pointsTeam totalMatchesSolo totalMatchesTeam"
    );

    if (!player) {
      res
        .status(404)
        .json(createError("PlayerNotFound", "Jogador não encontrado."));
      return;
    }

    const isFollowing = loggedInPlayerId
      ? player.followers.some(
          (followerId) =>
            followerId.toString() === loggedInPlayerId.toString()
        )
      : false;

    const followsMe = loggedInPlayerId
      ? player.following.some(
          (followingId) =>
            followingId.toString() === loggedInPlayerId.toString()
        )
      : false;

    res.status(200).json({
      ...player.toObject(),
      isFollowing,
      followsMe,
    });
  } catch (error) {
    console.error("Erro ao buscar jogador pelo ID:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao buscar jogador pelo ID."));
  }
};

export const getAllPlayers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const loggedInPlayerId = req.player?._id;

    const players = await Player.find();

    const response = players.map((player) => ({
      _id: player._id,
      name: player.name,
      nickname: player.nickname,
      avatarUrl: player.avatarUrl,
      pointsSolo: player.pointsSolo,
      pointsTeam: player.pointsTeam,
      totalMatchesSolo: player.totalMatchesSolo,
      totalMatchesTeam: player.totalMatchesTeam,
      soloWins: player.soloWins,
      soloLosses: player.soloLosses,
      teamWins: player.teamWins,
      teamLosses: player.teamLosses,
      partners: player.partners,
      followers: player.followers,
      following: player.following,
      // Indica se o jogador logado já segue este player
      isFollowing: loggedInPlayerId
        ? player.followers.some(
            (followerId) =>
              followerId.toString() === loggedInPlayerId.toString()
          )
        : false,
      // Indica se este player segue o jogador logado
      followsMe: loggedInPlayerId
        ? player.following.some(
            (followingId) =>
              followingId.toString() === loggedInPlayerId.toString()
          )
        : false,
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error("Erro ao buscar jogadores:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao buscar jogadores."));
  }
};

export const getBestPartner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(createError("InvalidId", "ID de jogador inválido."));
    }

    // Busca o jogador pelo ID
    const player = await Player.findById(id);
    if (!player) {
      return res
        .status(404)
        .json(createError("PlayerNotFound", "Jogador não encontrado."));
    }

    // Obtém o mapa de parceiros
    const partners = player.partners;

    // Converte o Map para array e filtra parceiros com score positivo
    const partnersArray = Array.from(partners.entries())
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1]);

    // Se não houver parceiros com score positivo
    if (partnersArray.length === 0) {
      return res.status(200).json({});
    }

    // Pega o melhor parceiro (primeiro da lista ordenada)
    const [bestPartnerId, bestPartnerScore] = partnersArray[0];

    // Busca os dados do parceiro
    const bestPartner = await Player.findById(bestPartnerId).select(
      "name nickname avatarUrl"
    );

    if (!bestPartner) {
      return res
        .status(404)
        .json(createError("PartnerNotFound", "Parceiro não encontrado."));
    }

    // Retorna os dados do parceiro
    res.status(200).json({
      _id: bestPartner._id,
      name: bestPartner.name,
      nickname: bestPartner.nickname,
      avatarUrl: bestPartner.avatarUrl,
      score: bestPartnerScore,
    });
  } catch (error) {
    console.error("[getBestPartner] Erro ao buscar melhor parceiro:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao buscar melhor parceiro."));
  }
};

export const getLastFiveMatchesByGamemode = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const playerId = req.player?._id;
    const { gamemode } = req.query;

    if (!playerId) {
      return res
        .status(401)
        .json(createError("Unauthorized", "Usuário não autenticado."));
    }

    if (
      !gamemode ||
      !["cara_a_cara", "parceirada"].includes(gamemode as string)
    ) {
      return res
        .status(400)
        .json(
          createError(
            "InvalidGamemode",
            "Gamemode inválido. Use 'cara_a_cara' ou 'parceirada'."
          )
        );
    }

    const query = {
      $or: [{ teamA: playerId }, { teamB: playerId }],
      gamemode: gamemode,
      status: "finished",
    };

    const matches = await Match.find(query)
      .select("gamemode teamA teamB winner status")
      .populate("teamA", "name nickname avatarUrl")
      .populate("teamB", "name nickname avatarUrl")
      .populate("winner", "name nickname")
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedMatches = matches.map((match) => ({
      gamemode: match.gamemode,
      teamA: match.teamA,
      teamB: match.teamB,
      winner: match.winner,
      playerTeam: match.teamA.some(
        (player: any) => player._id.toString() === playerId?.toString()
      )
        ? "teamA"
        : "teamB",
    }));

    res.status(200).json({
      matches: formattedMatches,
      total: formattedMatches.length,
    });
  } catch (error) {
    console.error("Erro ao buscar partidas:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao buscar partidas."));
  }
};

export const updatePlayer = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { name, nickname } = req.body;
    const file = req.file; // Arquivo enviado via FormData

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(createError("InvalidId", "ID de jogador inválido."));
    }

    let avatarUrl = null;

    // Se houver uma nova imagem, faz o upload para o Cloudinary
    if (file) {
      const uploadedResponse = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
          upload_preset: "player_avatars",
        }
      );
      avatarUrl = uploadedResponse.secure_url;
    }

    // Verifica se o jogador está colocando um nickname que já existe e permite que, se ele não alterar o próprio apelido, "passar"
    const existingPlayer = nickname
      ? await Player.findOne({ nickname })
      : null;

    if (existingPlayer && existingPlayer.id.toString() !== id) {
      return res
        .status(400)
        .json(createError("NicknameAlreadyExists", "Apelido já está em uso."));
    }

    // Atualiza os dados do jogador
    const updatedPlayer = (await Player.findByIdAndUpdate(
      id,
      {
        name,
        nickname,
        ...(avatarUrl && { avatarUrl }), // Atualiza a URL da imagem apenas se houver uma nova
      },
      { new: true } // Retorna o documento atualizado
    ).select("-password")) as PlayerDocument;

    if (!updatedPlayer) {
      return res
        .status(404)
        .json(createError("PlayerNotFound", "Jogador não encontrado."));
    }

    res.status(200).json(updatedPlayer);
  } catch (error) {
    console.error("Erro ao atualizar jogador:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao atualizar jogador."));
  }
};

export const deletePlayer = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(createError("InvalidId", "ID de jogador inválido."));
    }

    const deletedPlayer = await Player.findByIdAndDelete(id);

    if (!deletedPlayer) {
      return res
        .status(404)
        .json(createError("PlayerNotFound", "Jogador não encontrado."));
    }

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar jogador:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao deletar jogador."));
  }
};

// Buscar todos jogadores amigos e fazer ranking
export const getAllFollowPlayers = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const playerId = req.player?._id;

    if (!playerId) {
      return res
        .status(401)
        .json(createError("Unauthorized", "Usuário não autenticado."));
    }

    // busca o jogador logado para obter lista de seguidores
    const loggedInPlayer = await Player.findById(playerId);
    if (!loggedInPlayer) {
      return res
        .status(404)
        .json(createError("PlayerNotFound", "Jogador não encontrado."));
    }

    const playerIds = [playerId, ...loggedInPlayer.following];

    // verifica se o jogador segue alguém
    if (loggedInPlayer.following.length === 0) {
      return res.status(200).json({
        message:
          "Você ainda não segue nenhum jogador. Siga alguém para comparar a pontuação.",
        ranking: [],
      });
    }

    // busca os jogadores seguidos e ordena por pontuação
    const players = await Player.find({
      _id: { $in: playerIds },
    })
      .select(
        "name nickname avatarUrl pointsSolo pointsTeam totalMatchesSolo totalMatchesTeam"
      )
      .sort({ pointsSolo: -1, pointsTeam: -1 });

    const ranking = players
      .map((player) => ({
        _id: player._id,
        name: player.name,
        nickname: player.nickname,
        avatarUrl: player.avatarUrl,
        pointsSolo: player.pointsSolo,
        pointsTeam: player.pointsTeam,
        totalMatchesSolo: player.totalMatchesSolo,
        totalMatchesTeam: player.totalMatchesTeam,
        totalPoints: player.pointsSolo + player.pointsTeam,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    res.status(200).json({
      message: "Ranking dos jogadores seguidos.",
      ranking,
    });
  } catch (error) {
    console.error(
      "Não foi possível buscar os seguidores para fazer o ranking:",
      error
    );
    res
      .status(500)
      .json(
        createError(
          "ServerError",
          "Erro ao buscar ranking de jogadores seguidos."
        )
      );
  }
};

// Deletar todos os jogadores
export const deleteAllPlayers = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    await Player.deleteMany();
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar todos os jogadores:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao deletar todos os jogadores."));
  }
};
