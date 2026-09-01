import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api", routes);

export default app;