import { Response } from "express";
import mongoose from "mongoose";
import Player from "../models/Player";
import { createError } from "../utils/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";

interface PopulatedPlayerSummary {
  _id: mongoose.Types.ObjectId;
  name: string;
  nickname: string;
  avatarUrl?: string;
}

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

export const followPlayer = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id: playerToFollowId } = req.params;
    const loggedInPlayerId = req.player?._id;

    if (!loggedInPlayerId) {
      return res
        .status(401)
        .json(createError("Unauthorized", "Usuário não autenticado."));
    }

    if (!isValidObjectId(playerToFollowId)) {
      return res
        .status(400)
        .json(createError("InvalidId", "ID de jogador inválido."));
    }

    if (playerToFollowId.toString() === loggedInPlayerId.toString()) {
      return res
        .status(400)
        .json(
          createError("FollowSelf", "Você não pode se seguir a si mesmo.")
        );
    }

    const [playerToFollow, loggedInPlayer] = await Promise.all([
      Player.findById(playerToFollowId),
      Player.findById(loggedInPlayerId),
    ]);

    if (!playerToFollow || !loggedInPlayer) {
      return res
        .status(404)
        .json(createError("PlayerNotFound", "Jogador não encontrado."));
    }

    // Verifica se já está seguindo
    if (
      loggedInPlayer.following.some(
        (followingId) =>
          followingId.toString() === playerToFollow._id.toString()
      )
    ) {
      return res
        .status(400)
        .json(
          createError("AlreadyFollowing", "Você já está seguindo este jogador.")
        );
    }

    // Atualiza as listas de seguidores e seguindo
    await Promise.all([
      Player.findByIdAndUpdate(playerToFollow._id, {
        $addToSet: { followers: loggedInPlayer._id },
      }),
      Player.findByIdAndUpdate(loggedInPlayer._id, {
        $addToSet: { following: playerToFollow._id },
      }),
    ]);

    const response = {
      message: "Agora você está seguindo este jogador.",
      whoIFollow: {
        _id: playerToFollow._id,
        name: playerToFollow.name,
        nickname: playerToFollow.nickname,
        avatarUrl: playerToFollow.avatarUrl,
        isFollowing: true,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Erro ao seguir jogador:", error);
    res
      .status(500)
      .json(createError("InternalServerError", "Erro ao seguir jogador."));
  }
};

export const unfollowPlayer = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const followerId = req.player?._id;

    if (!followerId) {
      return res
        .status(401)
        .json(createError("Unauthorized", "Usuário não autenticado."));
    }

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json(createError("InvalidId", "ID de jogador inválido."));
    }

    const [playerToUnfollow, follower] = await Promise.all([
      Player.findById(id),
      Player.findById(followerId),
    ]);

    if (!playerToUnfollow || !follower) {
      return res
        .status(404)
        .json(createError("PlayerNotFound", "Jogador não encontrado."));
    }

    const wasFollowing = follower.following.some(
      (followingId) =>
        followingId.toString() === playerToUnfollow._id.toString()
    );

    if (!wasFollowing) {
      return res
        .status(400)
        .json(
          createError("NotFollowing", "Você não está seguindo este jogador.")
        );
    }

    // Remove das listas de seguidores e seguindo
    await Promise.all([
      Player.findByIdAndUpdate(id, {
        $pull: { followers: follower._id },
      }),
      Player.findByIdAndUpdate(followerId, {
        $pull: { following: playerToUnfollow._id },
      }),
    ]);

    res.status(200).json({
      message: "Você deixou de seguir este jogador.",
      following: {
        _id: playerToUnfollow._id,
        name: playerToUnfollow.name,
        nickname: playerToUnfollow.nickname,
        avatarUrl: playerToUnfollow.avatarUrl,
        isFollowing: false,
      },
    });
  } catch (error) {
    console.error("Erro ao deixar de seguir jogador:", error);
    res
      .status(500)
      .json(
        createError("InternalServerError", "Erro ao deixar de seguir jogador.")
      );
  }
};

export const getFollowers = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const loggedInPlayerId = req.player?._id;

    if (!loggedInPlayerId) {
      return res
        .status(401)
        .json(createError("Unauthorized", "Usuário não autenticado."));
    }

    const player = await Player.findById(loggedInPlayerId)
      .select("followers following")
      .populate("followers", "name nickname avatarUrl");

    if (!player) {
      return res
        .status(404)
        .json(createError("PlayerNotFound", "Jogador não encontrado."));
    }

    const followingIds = new Set(
      player.following.map((followingId) => followingId.toString())
    );

    const followers = (
      player.followers as unknown as PopulatedPlayerSummary[]
    ).map((follower) => ({
      _id: follower._id,
      name: follower.name,
      nickname: follower.nickname,
      avatarUrl: follower.avatarUrl,
      isFollowing: followingIds.has(follower._id.toString()),
      followsMe: true,
    }));

    res.status(200).json(followers);
  } catch (error) {
    console.error("Erro ao buscar seguidores:", error);
    res
      .status(500)
      .json(createError("InternalServerError", "Erro ao buscar seguidores."));
  }
};

export const getFollowing = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const loggedInPlayerId = req.player?._id;

    if (!loggedInPlayerId) {
      return res
        .status(401)
        .json(createError("Unauthorized", "Usuário não autenticado."));
    }

    const player = await Player.findById(loggedInPlayerId)
      .select("following")
      .populate("following", "name nickname avatarUrl");

    if (!player) {
      return res
        .status(404)
        .json(createError("PlayerNotFound", "Jogador não encontrado."));
    }

    const following = (
      player.following as unknown as PopulatedPlayerSummary[]
    ).map((followedPlayer) => ({
      _id: followedPlayer._id,
      name: followedPlayer.name,
      nickname: followedPlayer.nickname,
      avatarUrl: followedPlayer.avatarUrl,
      isFollowing: true,
    }));

    res.status(200).json(following);
  } catch (error) {
    console.error("Erro ao buscar seguindo:", error);
    res
      .status(500)
      .json(createError("InternalServerError", "Erro ao buscar seguindo."));
  }
};
