import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./database";

const router = Router();

router.post("/register-demo", async (_req: Request, res: Response) => {
  try {
    const senhaHash = await bcrypt.hash("123456", 10);

    await db.query(
      `INSERT INTO usuarios (empresa_id, nome, email, senha_hash, perfil)
       VALUES (?, ?, ?, ?, ?)`,
      [1, "Administrador", "admin@gennus.com", senhaHash, "ADMIN"]
    );

    return res.status(201).json({
      message: "Usuário demo criado com sucesso",
      email: "admin@gennus.com",
      senha: "123456",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao criar usuário demo",
      error,
    });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        message: "Email e senha são obrigatórios",
      });
    }

    const [rows] = await db.query<any[]>(
      `SELECT id, empresa_id, nome, email, senha_hash, perfil
       FROM usuarios
       WHERE email = ? AND ativo = TRUE`,
      [email]
    );

    const usuario = rows[0];

    if (!usuario) {
      return res.status(401).json({
        message: "Email ou senha inválidos",
      });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({
        message: "Email ou senha inválidos",
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        empresaId: usuario.empresa_id,
        perfil: usuario.perfil,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "8h" }
    );

    return res.json({
      message: "Login realizado com sucesso",
      token,
      usuario: {
        id: usuario.id,
        empresaId: usuario.empresa_id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno no login",
      error,
    });
  }
});

export default router;