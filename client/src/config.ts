import { z } from "zod";
import { stringValidator, urlvalidator } from "./lib/validators";

const configSchema = z.object({
  urls: z.object({
    socket: urlvalidator,
  }),
  token: z.object({
    auth_token: stringValidator,
  }),
});
type ConfigType = z.infer<typeof configSchema>;

const values: ConfigType = {
  urls: {
    socket: import.meta.env.VITE_SOCKET_URL,
  },
  token: {
    auth_token: import.meta.env.VITE_AUTH_TOKEN_FIELD,
  },
};

export const clientConfig = (() => {
  try {
    return configSchema.parse(values);
  } catch (error) {
    throw new Error(error as string);
  }
})();
