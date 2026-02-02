import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(10),
  CORS_ORIGIN: z.string().default("*")
});

export const env = schema.parse(process.env);
