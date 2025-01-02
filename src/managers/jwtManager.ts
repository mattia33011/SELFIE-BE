import jwt, { JwtPayload } from "jsonwebtoken";
import { UserSession } from "../types/user";
import { Request, Response } from "express";

class JwtManager {
  private readonly secretKey: string;

  constructor() {
    if (!process.env.JWT_SECRET_KEY) throw new Error("No JWT_Secret provided");

    this.secretKey = process.env.JWT_SECRET_KEY;
  }

  generateJwt(user: UserSession) {
    return jwt.sign(user, this.secretKey, {
      expiresIn: "10h",
      issuer: "SELFIE_BE",
      subject: user.email,
    });
  }

  isExpired(token: string) {
    try {
      jwt.verify(token, this.secretKey);
      return false;
    } catch (e: any) {
      return true;
    }
  }

  decodeToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.secretKey) as JwtPayload &
        UserSession;
      console.log(decoded);
      return decoded;
    } catch (e: any) {
      return undefined;
    }
  }
}

export const jwtMiddleWare = async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (!token || jwtManager.isExpired(token.substring(7))) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

const jwtManager = new JwtManager();
export default jwtManager;
