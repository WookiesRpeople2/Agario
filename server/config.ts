import { z } from "zod";
import { urlvalidator } from "./lib/validators";

const configSchema = z.object({
  ports: z.object({
    appPort: urlvalidator,
  }),
});
type ConfigType = z.infer<typeof configSchema>;

const values: ConfigType = {
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
