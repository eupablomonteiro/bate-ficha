import { Request, Response, NextFunction } from "express";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import matchRoutes from "./routes/matchRoutes";
import authRoutes from "./routes/authRoutes";
import playerRoutes from "./routes/playerRoutes";
import followRoutes from "./routes/followRoutes";
import settingsRoutes from "./routes/settingsRoutes";

// Middlewares
import { requestLogger } from "./middleware/logger";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";

// Utils
import { createError } from "./utils/errorHandler";
import swaggerUi from "swagger-ui-express";
import { generateOpenApiDocument } from "./docs";

// Config
dotenv.config();

interface CreateAppOptions {
  enableRateLimit?: boolean;
}

export const createApp = ({
  enableRateLimit = process.env.NODE_ENV !== "test",
}: CreateAppOptions = {}) => {
  const app = express();

  const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutos
    limit: 100, // 100 requisições por IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res
        .status(429)
        .json(
          createError(
            "TooManyRequests",
            "Muitas requisições, tente novamente mais tarde."
          )
        );
    },
  });

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  if (enableRateLimit) {
    app.use(limiter);
  }

  app.use(helmet());

  // Use Routes API
  app.use("/api", playerRoutes);
  app.use("/api", authRoutes);
  app.use("/api", matchRoutes);
  app.use("/api", followRoutes);
  app.use("/api", settingsRoutes);

  // Swagger docs
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(generateOpenApiDocument()));

  // 404 - rota não encontrada
  app.use((_req, res) => {
    res
      .status(404)
      .json(createError("RouteNotFound", "Endpoint não existe."));
  });

  // Middleware global de tratamento de erros
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Erro não tratado:", err);

    // Zod validation error
    if (err?.name === "ZodError") {
      const details = Array.isArray(err.issues) ? err.issues : err.errors;
      const messages = Array.isArray(details)
        ? details.map((e: any) => e.message).join("; ")
        : err.message;

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

    // Mongoose CastError (ObjectId inválido)
    if (err?.name === "CastError") {
      return res
        .status(400)
        .json(createError("InvalidId", "O ID fornecido não é válido."));
    }

    // Mongoose ValidationError
    if (err?.name === "ValidationError") {
      const messages = Object.values(err.errors || {})
        .map((e: any) => e.message)
        .join("; ");

      return res
        .status(400)
        .json(
          createError(
            "ValidationError",
            messages || "Dados inválidos.",
            err.errors
          )
        );
    }

    // Mongoose duplicate key
    if (err?.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0];
      return res
        .status(409)
        .json(
          createError(
            "Conflict",
            field
              ? `O campo ${field} já está em uso.`
              : "Já existe um registro com esses dados."
          )
        );
    }

    // JSON inválido enviado no corpo da requisição
    if (err?.type === "entity.parse.failed") {
      return res
        .status(400)
        .json(createError("InvalidJson", "Corpo da requisição inválido."));
    }

    // Corpo da requisição muito grande
    if (err?.type === "entity.too.large") {
      return res
        .status(413)
        .json(
          createError("PayloadTooLarge", "Corpo da requisição muito grande.")
        );
    }

    const status =
      typeof err?.status === "number" && err.status >= 400 && err.status < 600
        ? err.status
        : 500;

    if (status >= 500) {
      return res
        .status(status)
        .json(createError("InternalServerError", "Erro interno do servidor."));
    }

    return res
      .status(status)
      .json(
        createError(
          err?.error || "RequestError",
          err?.message || "Não foi possível processar a requisição."
        )
      );
  });

  return app;
};

const app = createApp();

export default app;
