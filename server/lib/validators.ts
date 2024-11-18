import { z } from "zod";

export const urlvalidator = z.string().url();
