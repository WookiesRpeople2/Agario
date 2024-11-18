import { z } from "zod";

export const urlvalidator = z.string().url();

export const stringValidator = z.string().min(3);

export const numberValidator = z.number();

export const emailValidator = z.string().email();

export const passwordValidator = z.string().min(6);

export const providerDataValidator = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  displayName: z.string().optional(),
  photos: z
    .array(
      z.object({
        value: z.string().url(),
      })
    )
    .optional(),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  profile: z
    .object({
      provider: z.string(),
      id: z.string(),
      displayName: z.string().optional(),
      name: z
        .object({
          familyName: z.string().optional(),
          givenName: z.string().optional(),
          middleName: z.string().optional(),
        })
        .optional(),
      emails: z
        .array(
          z.object({
            value: z.string().email(),
            verified: z.boolean().optional(),
          })
        )
        .optional(),
      photos: z
        .array(
          z.object({
            value: z.string().url(),
          })
        )
        .optional(),
    })
    .optional(),
});
