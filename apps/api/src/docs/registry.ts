import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// Schemas reutilizados
export const ErrorSchema = z
  .object({
    error: z.string(),
    message: z.string(),
    details: z.any().optional(),
  })
  .openapi("ApiError");

// Registra componentes
registry.register("ApiError", ErrorSchema);

export const generateOpenApiDocument = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Bate Ficha API",
      version: "1.0.0",
      description: "API do aplicativo Bate Ficha",
    },
    servers: [{ url: "/api" }],
  });
};
