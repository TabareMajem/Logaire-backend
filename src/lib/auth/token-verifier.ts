import { verify } from 'jsonwebtoken';

export async function verifyToken(token: string): Promise<boolean> {
  try {
    verify(token, process.env.JWT_SECRET!);
    return true;
  } catch (error) {
    return false;
  }
} 