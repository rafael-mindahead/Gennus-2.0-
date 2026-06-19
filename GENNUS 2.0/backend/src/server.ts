import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./auth.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "API Gennus rodando" });
});

app.use("/auth", authRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});