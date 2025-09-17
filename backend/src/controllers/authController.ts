import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../models/users";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export async function signup(req: Request, res: Response) {
  try {
    const { email, password, nickname, avatar_url, avatar_name } = (req.body || {}) as {
      email?: string; password?: string; nickname?: string; avatar_url?: string; avatar_name?: string;
    };
    if (!email || !password) return res.status(400).json({ message: "email and password are required" });

    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ message: "user already exists" });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await createUser({ email, password_hash, nickname, avatar_url, avatar_name });

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    return res.status(201).json({ token, user: { id: user.id, email: user.email, nickname: user.nickname, avatar_url: user.avatar_url, avatar_name: user.avatar_name } });
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

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user: { id: user.id, email: user.email, nickname: user.nickname, avatar_url: user.avatar_url, avatar_name: user.avatar_name } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


