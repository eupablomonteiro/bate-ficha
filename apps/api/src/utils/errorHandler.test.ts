import { describe, it, expect } from "vitest";
import { createError } from "./errorHandler";

describe("createError", () => {
  it("inclui details quando fornecido", () => {
    const err = createError("ValidationError", "msg", { foo: 1 });
    expect(err).toEqual({ error: "ValidationError", message: "msg", details: { foo: 1 } });
  });

  it("omite details quando ausente", () => {
    const err = createError("X", "y");
    expect(err).toEqual({ error: "X", message: "y" });
  });
});
