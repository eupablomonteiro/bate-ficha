import { Request, Response } from "express";
import Match from "../models/Match";
import Player from "../models/Player";

import { AuthenticatedRequest } from "../middleware/auth";
import mongoose from "mongoose";
import { createError } from "../utils/errorHandler";

// Criar partida
export const createMatch = async (req: Request, res: Response) => {
  try {
    const validatedData = req.body;

    // Verifica se os jogadores existem
    const players = [...validatedData.teamA, ...validatedData.teamB];
    const playersExists = await Player.find({ _id: { $in: players } });

    if (playersExists.length !== players.length) {
      return res
        .status(400)
        .json(
          createError(
            "PlayersNotFound",
            "Um ou mais jogadores não foram encontrados."
          )
        );
    }

    // Verifica se os jogadores participam de outra partida que não foi finalizada
    const runningMatches = await Match.find({
      status: "running",
      $or: [{ teamA: { $in: players } }, { teamB: { $in: players } }],
    });

    if (runningMatches.length > 0) {
      return res.status(400).json(
        createError(
          "PlayersInRunningMatch",
          "Jogadores já participam de outra partida. Finalizem a partida anterior para criar uma nova."
        )
      );
    }

    // Verifica se o gamemode cara a cara - não pode ter mais de 2 jogadores
    if (validatedData.gamemode === "cara_a_cara" && players.length !== 2) {
      return res
        .status(400)
        .json(
          createError(
            "InvalidTeamSize",
            "O modo cara a cara deve ter exatamente 2 jogadores (1x1)."
          )
        );
    }

    // Verifica se o gametype bolinho - não pode ter mais de 2 jogadores
    if (validatedData.gametype === "bolinho" && players.length !== 2) {
      return res
        .status(400)
        .json(
          createError(
            "InvalidBolinhoTeamSize",
            "A partida de bolinho deve ter exatamente 2 jogadores (1x1)."
          )
        );
    }

    // Criar a partida
    const match = new Match({
      gamemode: validatedData.gamemode,
      gametype: validatedData.gametype,
      teamA: validatedData.teamA,
      teamB: validatedData.teamB,
      finalizer: validatedData.finalizer,
      players: players,
      status: "running",
      winner: "none",
    });

    await match.save();

    res.status(201).json(match);
  } catch (error: any) {
    if (error?.name === "ZodError") {
      const details = Array.isArray(error.issues) ? error.issues : error.errors;
      const messages = Array.isArray(details)
        ? details.map((e: any) => e.message).join("; ")
        : error.message;
      console.error("Erro de validação ao criar partida:", error);
      return res
        .status(400)
        .json(
          createError(
            "ValidationError",
            messages || "Dados inválidos.",
            details
          )
        );
    }

    if (error?.name === "CastError" || error?.name === "ValidationError") {
      console.error("Erro de dados ao criar partida:", error);
      return res
        .status(400)
        .json(
          createError(
            "InvalidPlayerId",
            "ID de jogador inválido. Selecione jogadores válidos."
          )
        );
    }

    console.error("Erro ao criar partida:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao criar partida."));
  }
};

// Finalizar partida
export const finishMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = req.body;
    const { winner } = validatedData;
    const { finalizer } = validatedData;

    const match = await Match.findById(id);

    if (!match) {
      return res
        .status(404)
        .json(createError("MatchNotFound", "Partida não encontrada."));
    }

    if (match.finalizer.toString() !== finalizer.toString()) {
      return res
        .status(403)
        .json(
          createError(
            "Forbidden",
            "Você não tem permissão para finalizar esta partida."
          )
        );
    }

    if (match.status === "finished") {
      return res
        .status(400)
        .json(createError("MatchAlreadyFinished", "Partida já finalizada."));
    }

    // Define os times vencedor e perdedor
    const winningTeam = winner === "teamA" ? match.teamA : match.teamB;
    const losingTeam = winner === "teamA" ? match.teamB : match.teamA;

    // Atualiza o vencedor e o status da partida
    match.winner = winner;
    match.status = "finished";
    await match.save();

    // Contabiliza uma partida jogada para todos os jogadores participantes.
    if (match.gamemode === "cara_a_cara") {
      await Player.updateMany(
        { _id: { $in: match.players } },
        { $inc: { totalMatchesSolo: 1 } }
      );
    } else {
      await Player.updateMany(
        { _id: { $in: match.players } },
        { $inc: { totalMatchesTeam: 1 } }
      );
    }

    // Lógica de pontuação e estatísticas
    if (match.gamemode === "cara_a_cara") {
      // Modo 1X1
      await Player.findByIdAndUpdate(winningTeam[0], {
        $inc: { soloWins: 1, pointsSolo: 50 },
      });

      await Player.findByIdAndUpdate(losingTeam[0], {
        $inc: { soloLosses: 1, pointsSolo: -25 },
      });
    } else {
      // Modo parceirada
      // Atualizar Vencedores
      await Player.updateMany(
        { _id: { $in: winningTeam } },
        { $inc: { teamWins: 1, pointsTeam: 50 } }
      );

      // Atualizar Perdedores
      await Player.updateMany(
        { _id: { $in: losingTeam } },
        { $inc: { teamLosses: 1, pointsTeam: -25 } }
      );

      // Atualizar estatísticas de parceiradas
      for (const _id of winningTeam) {
        for (const partnerId of winningTeam) {
          if (_id !== partnerId) {
            await Player.findByIdAndUpdate(_id, {
              $inc: { [`partners.${partnerId}`]: 1 },
            });
          }
        }
      }

      // Atualizar estatísticas de parceiradas para perdedores
      for (const _id of losingTeam) {
        for (const partnerId of losingTeam) {
          if (_id !== partnerId) {
            await Player.findByIdAndUpdate(_id, {
              $inc: { [`partners.${partnerId}`]: -1 },
            });
          }
        }
      }
    }

    res.status(200).json(match);
  } catch (error: any) {
    if (error?.name === "ZodError") {
      const details = Array.isArray(error.issues) ? error.issues : error.errors;
      const messages = Array.isArray(details)
        ? details.map((e: any) => e.message).join("; ")
        : error.message;

      return res
        .status(400)
        .json(
          createError(
            "ValidationError",
            messages || "Dados inválidos.",
            details
          )
        );
    }

    console.error("Erro ao finalizar partida:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao finalizar partida."));
  }
};

// Atualizar/Editar detalhes da partida antes de ser finalizada
export const editMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = req.body;
    const { finalizerId } = req.body;

    // Buscar a partida
    const match = await Match.findById(id);
    if (!match) {
      return res
        .status(404)
        .json(createError("MatchNotFound", "Partida não encontrada."));
    }

    // Verificar se quem está editando é o finalizador
    if (match.finalizer.toString() !== finalizerId) {
      return res
        .status(403)
        .json(
          createError(
            "Forbidden",
            "Apenas o finalizador pode editar esta partida."
          )
        );
    }

    // Verificar se a partida já foi finalizada
    if (match.status === "finished") {
      return res
        .status(400)
        .json(
          createError(
            "MatchAlreadyFinished",
            "Não é possível editar uma partida finalizada."
          )
        );
    }

    // Verificar se os novos jogadores existem
    const newPlayers = [...validatedData.teamA, ...validatedData.teamB];
    const playersExists = await Player.find({ _id: { $in: newPlayers } });

    if (playersExists.length !== newPlayers.length) {
      return res
        .status(400)
        .json(
          createError(
            "PlayersNotFound",
            "Um ou mais jogadores não foram encontrados."
          )
        );
    }

    // Validações de modo de jogo e tipo
    if (validatedData.gamemode === "cara_a_cara") {
      // Validar que é 1x1
      if (
        validatedData.teamA.length !== 1 ||
        validatedData.teamB.length !== 1
      ) {
        return res
          .status(400)
          .json(
            createError(
              "InvalidTeamSize",
              "O modo cara a cara deve ter exatamente 2 jogadores (1x1)."
            )
          );
      }
    }

    // Validar combinações inválidas de gamemode e gametype
    if (validatedData.gametype === "bolinho") {
      if (validatedData.gamemode !== "cara_a_cara") {
        return res
          .status(400)
          .json(
            createError(
              "InvalidGameMode",
              "O tipo bolinho só pode ser jogado no modo cara a cara."
            )
          );
      }
      if (
        validatedData.teamA.length !== 1 ||
        validatedData.teamB.length !== 1
      ) {
        return res
          .status(400)
          .json(
            createError(
              "InvalidBolinhoTeamSize",
              "A partida de bolinho deve ter exatamente 2 jogadores (1x1)."
            )
          );
      }
    }

    // Verificar se os novos jogadores não estão em outras partidas
    const runningMatches = await Match.find({
      _id: { $ne: id },
      status: "running",
      $or: [{ teamA: { $in: newPlayers } }, { teamB: { $in: newPlayers } }],
    });

    if (runningMatches.length > 0) {
      return res
        .status(400)
        .json(
          createError(
            "PlayersInRunningMatch",
            "Alguns dos jogadores já participam de outra partida em andamento."
          )
        );
    }

    // Atualizar a partida
    const updatedMatch = await Match.findByIdAndUpdate(
      id,
      {
        gamemode: validatedData.gamemode,
        gametype: validatedData.gametype,
        teamA: validatedData.teamA,
        teamB: validatedData.teamB,
        players: newPlayers,
      },
      { new: true }
    ).populate("teamA teamB finalizer", "name nickname avatarUrl");

    res.status(200).json(updatedMatch);
  } catch (error: any) {
    if (error?.name === "ZodError") {
      const details = Array.isArray(error.issues) ? error.issues : error.errors;
      const messages = Array.isArray(details)
        ? details.map((e: any) => e.message).join("; ")
        : error.message;

      return res
        .status(400)
        .json(
          createError(
            "ValidationError",
            messages || "Dados inválidos.",
            details
          )
        );
    }

    console.error("Erro ao editar partida:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao editar partida."));
  }
};

// depois de ser finalizada
export const editMatchAfterFinished = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newWinner, finalizerId, newTeamA, newTeamB } = req.body;

    // Buscar a partida com os dados dos jogadores
    const match = await Match.findById(id)
      .populate("teamA")
      .populate("teamB");

    if (!match) {
      return res
        .status(404)
        .json(createError("MatchNotFound", "Partida não encontrada."));
    }

    // Verificações iniciais
    if (match.finalizer.toString() !== finalizerId) {
      return res
        .status(403)
        .json(
          createError(
            "Forbidden",
            "Apenas o finalizador pode editar esta partida."
          )
        );
    }

    if (match.status !== "finished") {
      return res
        .status(400)
        .json(
          createError("MatchNotFinished", "Esta partida não está finalizada.")
        );
    }

    try {
      // 1. Lidar com a mudança de jogadores
      if (newTeamA || newTeamB) {
        // Identificar jogadores removidos e adicionados
        const oldPlayers = [...match.teamA, ...match.teamB].map((player: any) =>
          player._id.toString()
        );

        // Garantir que estamos trabalhando com strings de ID
        const currentTeamA = match.teamA.map((p: any) => p._id.toString());
        const currentTeamB = match.teamB.map((p: any) => p._id.toString());

        const newPlayers = [
          ...(newTeamA || currentTeamA),
          ...(newTeamB || currentTeamB),
        ];

        const removedPlayers = oldPlayers.filter(
          (p) => !newPlayers.includes(p)
        );
        const addedPlayers = newPlayers.filter((p) => !oldPlayers.includes(p));

        // Para cada jogador removido
        for (const playerId of removedPlayers) {
          const wasWinner =
            match.winner === "teamA"
              ? match.teamA.some(
                  (player: any) => player._id.toString() === playerId
                )
              : match.teamB.some(
                  (player: any) => player._id.toString() === playerId
                );

          if (match.gamemode === "cara_a_cara") {
            await Player.findByIdAndUpdate(playerId, {
              $inc: {
                totalMatchesSolo: -1,
                soloWins: wasWinner ? -1 : 0,
                soloLosses: wasWinner ? 0 : -1,
                pointsSolo: wasWinner ? -50 : 25,
              },
            });
          } else {
            await Player.findByIdAndUpdate(playerId, {
              $inc: {
                totalMatchesTeam: -1,
                teamWins: wasWinner ? -1 : 0,
                teamLosses: wasWinner ? 0 : -1,
                pointsTeam: wasWinner ? -50 : 25,
              },
            });

            // Atualizar parcerias antigas
            const teammateDocs = wasWinner
              ? match.winner === "teamA"
                ? match.teamA
                : match.teamB
              : match.winner === "teamA"
              ? match.teamB
              : match.teamA;

            // Extrair os IDs dos colegas de equipe
            for (const teammate of teammateDocs) {
              const teammateId = (teammate as any)._id.toString();
              if (teammateId !== playerId) {
                await Player.findByIdAndUpdate(playerId, {
                  $inc: { [`partners.${teammateId}`]: -1 },
                });
                await Player.findByIdAndUpdate(teammateId, {
                  $inc: { [`partners.${playerId}`]: -1 },
                });
              }
            }
          }
        }

        // Para cada jogador adicionado
        for (const playerId of addedPlayers) {
          const isWinner = newTeamA?.includes(playerId)
            ? match.winner === "teamA"
            : match.winner === "teamB";

          if (match.gamemode === "cara_a_cara") {
            await Player.findByIdAndUpdate(playerId, {
              $inc: {
                totalMatchesSolo: 1,
                soloWins: isWinner ? 1 : 0,
                soloLosses: isWinner ? 0 : 1,
                pointsSolo: isWinner ? 50 : -25,
              },
            });
          } else {
            await Player.findByIdAndUpdate(playerId, {
              $inc: {
                totalMatchesTeam: 1,
                teamWins: isWinner ? 1 : 0,
                teamLosses: isWinner ? 0 : 1,
                pointsTeam: isWinner ? 50 : -25,
              },
            });

            // Adicionar novas parcerias
            const teammateIds = isWinner
              ? newTeamA?.includes(playerId)
                ? newTeamA
                : newTeamB
              : newTeamA?.includes(playerId)
              ? newTeamA
              : newTeamB;

            for (const teammateId of teammateIds) {
              if (teammateId !== playerId) {
                await Player.findByIdAndUpdate(playerId, {
                  $inc: { [`partners.${teammateId}`]: 1 },
                });
                await Player.findByIdAndUpdate(teammateId, {
                  $inc: { [`partners.${playerId}`]: 1 },
                });
              }
            }
          }
        }

        // Atualizar times na partida
        if (newTeamA) match.teamA = newTeamA;
        if (newTeamB) match.teamB = newTeamB;
      }

      // 2. Lidar com a mudança de vencedor
      if (newWinner && newWinner !== match.winner) {
        const oldWinningTeamDocs =
          match.winner === "teamA" ? match.teamA : match.teamB;
        const oldLosingTeamDocs =
          match.winner === "teamA" ? match.teamB : match.teamA;

        if (match.gamemode === "cara_a_cara") {
          // Reverter pontuação do antigo vencedor
          await Player.findByIdAndUpdate((oldWinningTeamDocs[0] as any)._id, {
            $inc: {
              soloWins: -1,
              soloLosses: 1,
              pointsSolo: -75,
            },
          });

          // Reverter pontuação do antigo perdedor
          await Player.findByIdAndUpdate((oldLosingTeamDocs[0] as any)._id, {
            $inc: {
              soloWins: 1,
              soloLosses: -1,
              pointsSolo: 75,
            },
          });
        } else {
          // Reverter pontuação do time vencedor anterior
          for (const player of oldWinningTeamDocs) {
            await Player.findByIdAndUpdate((player as any)._id, {
              $inc: {
                teamWins: -1,
                teamLosses: 1,
                pointsTeam: -75,
              },
            });
          }

          // Reverter pontuação do time perdedor anterior
          for (const player of oldLosingTeamDocs) {
            await Player.findByIdAndUpdate((player as any)._id, {
              $inc: {
                teamWins: 1,
                teamLosses: -1,
                pointsTeam: 75,
              },
            });
          }
        }

        match.winner = newWinner;
      }

      // Salvar alterações na partida
      await match.save();

      // Buscar a partida atualizada com os dados populados
      const updatedMatch = await Match.findById(id)
        .populate("teamA", "name nickname avatarUrl pointsSolo pointsTeam")
        .populate("teamB", "name nickname avatarUrl pointsSolo pointsTeam")
        .populate("finalizer", "name nickname avatarUrl");

      res.status(200).json({
        message: "Partida atualizada com sucesso",
        match: updatedMatch,
      });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error("Erro ao editar partida finalizada:", error);
    res
      .status(500)
      .json(
        createError("ServerError", "Erro ao editar partida finalizada.")
      );
  }
};

// Buscar partida pela id no parametro
export const getMatchById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verifica se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(createError("InvalidId", "O ID fornecido não é válido."));
    }

    const match = await Match.findById(id)
      .populate("teamA", "name nickname avatarUrl")
      .populate("teamB", "name nickname avatarUrl")
      .populate("finalizer", "name nickname avatarUrl");

    if (!match) {
      return res
        .status(404)
        .json(createError("MatchNotFound", "Partida não encontrada."));
    }

    // Formata o retorno para ser mais consistente
    const response = {
      id: match._id,
      gamemode: match.gamemode,
      gametype: match.gametype,
      status: match.status,
      teamA: match.teamA,
      teamB: match.teamB,
      winner: match.winner,
      finalizer: match.finalizer,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Erro ao buscar partida:", error);

    // Tratamento de erros específicos
    if (error instanceof mongoose.Error.CastError) {
      return res
        .status(400)
        .json(createError("InvalidId", "O ID fornecido não é válido."));
    }

    res
      .status(500)
      .json(
        createError("InternalServerError", "Ocorreu um erro ao buscar a partida.")
      );
  }
};

// Buscar todas as partidas do jogador logado
export const getMatchesByPlayer = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const playerId = req.player?._id;

    if (!playerId) {
      return res
        .status(401)
        .json(createError("Unauthorized", "Jogador não encontrado."));
    }

    const matches = await Match.find({
      $or: [{ teamA: playerId }, { teamB: playerId }, { finalizer: playerId }],
    })
      .select("createdAt updatedAt")
      .populate("teamA", "name nickname")
      .populate("teamB", "name nickname")
      .populate("winner", "name nickname");

    res.status(200).json(matches);
  } catch (error) {
    console.error("Erro ao buscar partidas do jogador:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao buscar partidas do jogador."));
  }
};

// Buscar todas as partidas do jogador logado em modo 1X1
export const getSoloMatchesByPlayerLogged = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const playerId = req.player?._id;

    if (!playerId) {
      return res
        .status(401)
        .json(createError("Unauthorized", "Jogador não encontrado."));
    }

    // Parametros de paginação
    const page = (req.query.page as unknown as number) || 1;
    const limit = (req.query.limit as unknown as number) || 5;
    const skip = (page - 1) * limit;

    // Busca o total de partidas para calcular o total de páginas
    const totalMatches = await Match.countDocuments({
      $or: [{ teamA: playerId }, { teamB: playerId }, { finalizer: playerId }],
      gamemode: "cara_a_cara",
    });

    const matches = await Match.find({
      $or: [{ teamA: playerId }, { teamB: playerId }, { finalizer: playerId }],
      gamemode: "cara_a_cara",
    })
      .select("gametype gamemode createdAt updatedAt finalizer status")
      .populate("teamA", "name nickname")
      .populate("teamB", "name nickname")
      .populate("winner", "name nickname")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalMatches / limit);

    res.status(200).json({
      matches,
      pagination: {
        currentPage: page,
        totalPages,
        totalMatches,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar partidas do jogador:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao buscar partidas do jogador."));
  }
};

// Buscar todas as partidas do jogador logado em modo parceirada
export const getTeamMatchesByPlayerLogged = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const playerId = req.player?._id;

    if (!playerId) {
      return res
        .status(401)
        .json(createError("Unauthorized", "Jogador não encontrado."));
    }

    // Parametros de paginação
    const page = (req.query.page as unknown as number) || 1;
    const limit = (req.query.limit as unknown as number) || 5;
    const skip = (page - 1) * limit;

    // Busca o total de partidas para calcular o total de páginas
    const totalMatches = await Match.countDocuments({
      $or: [{ teamA: playerId }, { teamB: playerId }, { finalizer: playerId }],
      gamemode: "parceirada",
    });

    const matches = await Match.find({
      $or: [{ teamA: playerId }, { teamB: playerId }, { finalizer: playerId }],
      gamemode: "parceirada",
    })
      .select("gametype gamemode createdAt updatedAt finalizer status")
      .populate("teamA", "name nickname")
      .populate("teamB", "name nickname")
      .populate("winner", "name nickname")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalMatches / limit);

    res.status(200).json({
      matches,
      pagination: {
        currentPage: page,
        totalPages,
        totalMatches,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar partidas do jogador:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao buscar partidas do jogador."));
  }
};

// Buscar todas as partidas de todos os jogadores
export const getMatchHistory = async (req: Request, res: Response) => {
  try {
    const matches = await Match.find()
      .select("gametype gamemode teamA teamB winner status")
      .populate("teamA", "name nickname")
      .populate("teamB", "name nickname")
      .populate("winner", "name nickname");

    res.status(200).json(matches);
  } catch (error) {
    console.error("Erro ao buscar histórico de partidas:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao buscar histórico de partidas."));
  }
};

// Deletar todas as partidas e reiniciar histórico completo dos jogadores
export const deleteAllMatches = async (req: Request, res: Response) => {
  try {
    await Match.deleteMany({});
    await Player.updateMany(
      {},
      {
        $set: {
          totalMatchesSolo: 0,
          totalMatchesTeam: 0,
          pointsSolo: 150,
          pointsTeam: 150,
          soloWins: 0,
          soloLosses: 0,
          teamWins: 0,
          teamLosses: 0,
          partners: {},
        },
      }
    );
    res.status(200).json({
      message: "Todas as partidas foram deletadas e o histórico foi reiniciado",
    });
  } catch (error) {
    console.error("Erro ao deletar todas as partidas:", error);
    res
      .status(500)
      .json(createError("ServerError", "Erro ao deletar todas as partidas."));
  }
};
