import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { findSessionByToken } from "../models/sessions";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_ISSUER = process.env.JWT_ISSUER || "ai-journal-backend";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "ai-journal-frontend";

export interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "missing bearer token" });

    // Validate opaque session token
    const session = await findSessionByToken(token);
    if (!session) return res.status(401).json({ message: "invalid or expired session" });

    // Set user ID from session (no PII in token)
    req.user = { id: session.user_id };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "invalid or expired token" });
  }
}

// Internal JWT validation for service-to-service communication
export function validateInternalJWT(token: string): { user_id: number } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ["HS256"] // Explicitly allow only HS256
    }) as any;
    
    return { user_id: Number(payload.sub) };
  } catch (err) {
    return null;
  }
}


