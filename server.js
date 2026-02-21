import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import connectDB from "./config/database.js"
import userRoutes from "./routes/userRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import userManagerRoutes from "./routes/userManagerRoutes.js";

dotenv.config();

const app = express();

app.use(cors({origin: "http://localhost:3000",
  credentials: true}));
app.use(express.json());
const DATABASE_URL = process.env.DATABASE_URL;


connectDB(DATABASE_URL);
app.use("/api/users", userRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/userManagers", userManagerRoutes);



const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
