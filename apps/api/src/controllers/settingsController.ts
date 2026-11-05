import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import UserSettings from "../models/PlayerSettings";
import { createError } from "../utils/errorHandler";

// Obter configurações do usuário
export const getUserSettings = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const playerId = req.player?._id;

    if (!playerId) {
      return res
        .status(401)
        .json(createError("Unauthorized", "Jogador não autenticado."));
    }

    // Buscar ou criar configurações
    let settings = await UserSettings.findOne({ playerId });

    // Se não existir, cria com valores padrão
    if (!settings) {
      settings = await UserSettings.create({
        playerId,
        allowCookies: false,
      });
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error("Erro ao obter configurações:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao obter configurações."));
  }
};

// Atualizar configurações
export const updateUserSettings = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const playerId = req.player?._id;
    const { allowCookies } = req.body;

    if (!playerId) {
      return res
        .status(401)
        .json(createError("Unauthorized", "Jogador não autenticado."));
    }

    // Valida o tipo de dados
    if (typeof allowCookies !== "boolean") {
      return res
        .status(400)
        .json(
          createError(
            "ValidationError",
            "O campo allowCookies deve ser um booleano."
          )
        );
    }

    // Atualizar ou criar configurações
    const settings = await UserSettings.findOneAndUpdate(
      { playerId },
      { allowCookies },
      { new: true, upsert: true }
    );

    res.status(200).json(settings);
  } catch (error) {
    console.error("Erro ao atualizar configurações:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao atualizar configurações."));
  }
};

// Obter configurações de animação
export const getAnimationSettings = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const playerId = req.player?._id;

    if (!playerId) {
      return res
        .status(401)
        .json(createError("Unauthorized", "Jogador não autenticado."));
    }

    // Buscar configurações do jogador
    let settings = await UserSettings.findOne({ playerId });

    // Se não existir, cria com valores padrão
    if (!settings) {
      settings = await UserSettings.create({
        playerId,
        allowCookies: false,
        animations: {
          enabled: true,
          transitionDuration: 2.0,
        },
      });
    }

    // Retorna apenas as configurações de animação
    res.status(200).json(settings.animations);
  } catch (error) {
    console.error("Erro ao obter configurações de animação:", error);
    res
      .status(500)
      .json(
        createError("ServerError", "Erro ao obter configurações de animação.")
      );
  }
};

// Atualizar configurações de animação
export const updateAnimationSettings = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const playerId = req.player?._id;
    const { enabled, transitionDuration } = req.body;

    if (!playerId) {
      return res
        .status(401)
        .json(createError("Unauthorized", "Jogador não autenticado."));
    }

    // Validar dados
    if (typeof enabled !== "undefined" && typeof enabled !== "boolean") {
      return res
        .status(400)
        .json(
          createError(
            "ValidationError",
            "O campo enabled deve ser um booleano."
          )
        );
    }

    if (typeof transitionDuration !== "undefined") {
      if (typeof transitionDuration !== "number") {
        return res
          .status(400)
          .json(
            createError(
              "ValidationError",
              "O campo transitionDuration deve ser um número."
            )
          );
      }

      // Validar limites
      if (transitionDuration < 0 || transitionDuration > 5.0) {
        return res
          .status(400)
          .json(
            createError(
              "ValidationError",
              "A duração da transição deve estar entre 0 e 5 segundos."
            )
          );
      }
    }

    // Buscar configurações atuais primeiro
    let settings = await UserSettings.findOne({ playerId });
    
    // Se não existir, criar com valores padrão
    if (!settings) {
      settings = new UserSettings({
        playerId,
        allowCookies: false,
        animations: {
          enabled: true,
          transitionDuration: 2.0,
        }
      });
    }

    // Atualizar apenas os campos fornecidos
    if (typeof enabled !== "undefined") {
      settings.animations.enabled = enabled;
    }
    if (typeof transitionDuration !== "undefined") {
      settings.animations.transitionDuration = transitionDuration;
    }

    // Salvar alterações
    await settings.save();

    res.status(200).json(settings.animations);
  } catch (error) {
    console.error("Erro ao atualizar configurações de animação:", error);
    res
      .status(500)
      .json(
        createError(
          "ServerError",
          "Erro ao atualizar configurações de animação."
        )
      );
  }
}; 