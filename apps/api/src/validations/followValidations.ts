import { z } from "zod";
import { objectIdSchema } from "./common";

export const followIdParamSchema = z.object({
  id: objectIdSchema,
});
