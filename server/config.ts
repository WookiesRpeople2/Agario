import { z } from "zod";
import { stringValidator, urlvalidator } from "./lib/validators";

const configSchema = z.object({
  db: z.object({
    mongoUrl: urlvalidator,
  }),
  ports: z.object({
    appPort: stringValidator,
  }),
});
type ConfigType = z.infer<typeof configSchema>;

const values: ConfigType = {
  db: {
    mongoUrl: process.env.MONGO_URL!,
  },
  ports: {
    appPort: process.env.PORT!,
  },
};

export const apiConfig = (() => {
  try {
    return configSchema.parse(values);
  } catch (error) {
    throw new Error(error as string);
  }
})();
