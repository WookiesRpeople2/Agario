import type { JwtPayload } from "jsonwebtoken";
import type { Users } from "../models/users";

declare module "jsonwebtoken" {
  interface JwtPayload extends JwtPayload {
    [key: string]: DocumentType<Users>;
  }
}
