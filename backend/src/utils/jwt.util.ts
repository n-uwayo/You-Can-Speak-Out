import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types';

export class JwtUtil {
  private static readonly SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

  static generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.SECRET, { expiresIn: '1h' });
  }

  static verifyToken(token: string): JwtPayload {
    return jwt.verify(token, this.SECRET) as JwtPayload;
  }

  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }
}