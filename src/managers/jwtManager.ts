import jwt, { JwtPayload } from "jsonwebtoken";
import { UserSession } from "../types/user";
import { NextFunction, Request, Response } from "express";
import { log } from "console";
import { getSelfieError } from "../types/error";

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
      log(token);
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

export const jwtMiddleWare = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;
  const error = getSelfieError("NO_AUTH", 401, "The subject is not the requester")
  if (!token || jwtManager.isExpired(token.substring(7))) {
    res.status(401).json(error);
    return;
  }
  const decodedToken = jwtManager.decodeToken(
    req.headers.authorization!.substring(7)
  );
  if (
    decodedToken?.email != req.params.userid &&
    decodedToken?.username != req.params.userid
  ) {
    res
      .status(401)
      .json(error);
    return;
  }

  req.body = {...req.body, _userSession: decodedToken};
  next();
};

const jwtManager = new JwtManager();
export default jwtManager;
