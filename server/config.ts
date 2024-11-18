import "dotenv/config";
import { z } from "zod";
import { stringValidator, urlvalidator } from "./lib/validators";

const configSchema = z.object({
  db: z.object({
    mongoUrl: urlvalidator,
  }),
  ports: z.object({
    appPort: stringValidator,
    wsPort: stringValidator,
  }),
  auth: z.object({
    jwtSecret: stringValidator,
  }),
  cors: z.object({
    origin: z.string().array(),
    methods: z.string().array(),
    credentials: z.boolean(),
    allowedHeaders: z.string().array(),
  }),
});
type ConfigType = z.infer<typeof configSchema>;

const values: ConfigType = {
  db: {
    mongoUrl: process.env.MONGO_URL!,
  },
  ports: {
    appPort: process.env.PORT!,
    wsPort: process.env.WS_PORT!,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET!,
  },
  cors: {
    origin: process.env.CORS_ORIGIN!.split(","),
    methods: process.env.CORS_ALLOWED_METHODES!.split(","),
    credentials: Boolean(process.env.CORS_CREDENTIALS!),
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS!.split(","),
  },
};

export const apiConfig = (() => {
  try {
    return configSchema.parse(values);
  } catch (error) {
    throw new Error(error as string);
  }
})();
