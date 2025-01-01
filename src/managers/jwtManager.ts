import jwt, { JwtPayload } from 'jsonwebtoken';
import { User, UserSession } from '../types/user';
import { NextFunction, Request, Response } from 'express';

class JwtManager {
  private secretKey: string;

  constructor() {
    if(!process.env.JWT_SECRET_KEY)
        throw new Error('No JWT_Secret provided')
    
    this.secretKey = process.env.JWT_SECRET_KEY;
  }

  generateJwt(user: UserSession) {
    return jwt.sign(user, this.secretKey, {
      expiresIn: '10h',
      issuer: 'SELFIE_BE',
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

export const jwtMiddleWare: any = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token || jwtManager.isExpired(token.substring(7))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next()
};

const jwtManager = new JwtManager();
export default jwtManager;
