import { Request, Response } from "express";
import Player from "../models/Player";
import bcrypt from "bcryptjs";
import { createError } from "../utils/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";

// Função para registrar um novo jogador
export const registerPlayer = async (req: Request, res: Response) => {
  try {
    const { name, nickname, password } = req.body;

    const existingPlayer = await Player.findOne({ nickname });
    if (existingPlayer) {
      return res
        .status(400)
        .json(
          createError("PlayerExists", "Já existe um jogador com este apelido.")
        );
    }

    const player = new Player({
      name,
      nickname,
      password,
    });

    await player.save();
    const token = player.generateAuthToken();

    const playerResponse = {
      _id: player.id,
      name: player.name,
      nickname: player.nickname,
      avatarUrl: player.avatarUrl,
      followers: player.followers,
      following: player.following,
      partners: player.partners,
      pointsSolo: player.pointsSolo,
      pointsTeam: player.pointsTeam,
      totalMatchesSolo: player.totalMatchesSolo,
      totalMatchesTeam: player.totalMatchesTeam,
      soloWins: player.soloWins,
      soloLosses: player.soloLosses,
      teamWins: player.teamWins,
      teamLosses: player.teamLosses,
    };

    res.status(201).json({ player: playerResponse, token });
  } catch (error) {
    console.error("Erro ao registrar jogador:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao registrar jogador."));
  }
};

// Função para fazer login de um jogador
export const loginPlayer = async (req: Request, res: Response) => {
  try {
    const { nickname, password } = req.body;

    const player = await Player.findOne({ nickname });
    if (!player) {
      return res
        .status(400)
        .json(
          createError(
            "InvalidProfileCredentials",
            "Não existe nenhum jogador com essas credenciais."
          )
        );
    }

    const isMatch = await bcrypt.compare(password, player.password);
    if (!isMatch) {
      return res
        .status(400)
        .json(
          createError(
            "InvalidPasswordCredentials",
            "Credenciais inválidas, verifique sua senha."
          )
        );
    }

    const token = player.generateAuthToken();

    const playerResponse = {
      _id: player._id,
      name: player.name,
      nickname: player.nickname,
      avatarUrl: player.avatarUrl,
      followers: player.followers,
      following: player.following,
      partners: player.partners,
      pointsSolo: player.pointsSolo,
      pointsTeam: player.pointsTeam,
      totalMatchesSolo: player.totalMatchesSolo,
      totalMatchesTeam: player.totalMatchesTeam,
      soloWins: player.soloWins,
      soloLosses: player.soloLosses,
      teamWins: player.teamWins,
      teamLosses: player.teamLosses,
    };

    res.status(200).json({ player: playerResponse, token });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json(createError("LoginError", "Erro ao fazer login."));
  }
};

// Função para verificar se um jogador está autenticado
export const verifyPlayer = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const player = req.player;

  if (!player) {
    return res
      .status(401)
      .json(createError("Unauthorized", "Usuário não autenticado."));
  }

  res.status(200).json({ player });
};

// Função para deslogar um jogador
export const logoutPlayer = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  res.clearCookie("token");
  res.clearCookie("player");
  res.status(200).json({ message: "Deslogado com sucesso" });
};
