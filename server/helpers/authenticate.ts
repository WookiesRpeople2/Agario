import jwt from "jsonwebtoken";
import { apiConfig } from "../config";
import { Users } from "../models/users";

export const authenticate = async <T>(
  getToken: () => string | undefined,
  onSuccess: (user: any) => void,
  onFailure: (error: string) => void
): Promise<void> => {
  const token = getToken();

  if (!token) {
    onFailure("No token provided");
    return;
  }

  try {
    const { _id } = jwt.verify(
      token,
      apiConfig.auth.jwtSecret
    ) as jwt.JwtPayload;
    const user = await Users.findOne({ _id });

    if (!user) {
      onFailure("User not found");
      return;
    }

    onSuccess(user);
  } catch (error) {
    onFailure("Authentication failed");
  }
};
