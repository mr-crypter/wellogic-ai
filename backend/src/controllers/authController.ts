import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../models/users.js";
import { createSession, findSessionByToken } from "../models/sessions.js";
import { validatePasswordStrength } from "../utils/password.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_ISSUER = process.env.JWT_ISSUER || "ai-journal-backend";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "ai-journal-frontend";

export async function signup(req: Request, res: Response) {
  try {
    const { email, password, nickname, avatar_url, avatar_name } = (req.body || {}) as {
      email?: string; password?: string; nickname?: string; avatar_url?: string; avatar_name?: string;
    };
    if (!email || !password) return res.status(400).json({ message: "email and password are required" });

    const strength = validatePasswordStrength(password, email);
    if (!strength.ok) {
      return res.status(400).json({ message: "weak password", details: strength.errors });
    }

    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ message: "user already exists" });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await createUser({ email, password_hash, nickname, avatar_url, avatar_name });

    // Create opaque session token (no PII)
    const sessionToken = await createSession({ user_id: user.id });
    
    // Internal JWT with minimal claims (no PII)
    const internalToken = jwt.sign(
      { sub: user.id }, 
      JWT_SECRET, 
      { 
        expiresIn: "7d",
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        algorithm: "HS256"
      }
    );
    
    return res.status(201).json({ 
      token: sessionToken, // Opaque token for frontend
      user: { id: user.id, email: user.email, nickname: user.nickname, avatar_url: user.avatar_url, avatar_name: user.avatar_name } 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = (req.body || {}) as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ message: "email and password are required" });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "invalid credentials" });

    // Create opaque session token (no PII)
    const sessionToken = await createSession({ user_id: user.id });
    
    // Internal JWT with minimal claims (no PII)
    const internalToken = jwt.sign(
      { sub: user.id }, 
      JWT_SECRET, 
      { 
        expiresIn: "7d",
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        algorithm: "HS256"
      }
    );
    
    return res.json({ 
      token: sessionToken, // Opaque token for frontend
      user: { id: user.id, email: user.email, nickname: user.nickname, avatar_url: user.avatar_url, avatar_name: user.avatar_name } 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


