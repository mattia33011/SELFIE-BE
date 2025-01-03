import jwt, { JwtPayload } from "jsonwebtoken";
import { UserSession } from "../types/user";

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
      return jwt.verify(token, this.secretKey) == undefined;
    } catch (e: any) {
      return true;
    }
  }

  decodeToken(token: string): (JwtPayload & UserSession) | undefined {
    try {
      return jwt.verify(token, this.secretKey) as JwtPayload & UserSession;
    } catch (e: any) {
      console.log(JSON.stringify(e));
      return undefined;
    }
  }
}

const jwtManager = new JwtManager();
export default jwtManager;
