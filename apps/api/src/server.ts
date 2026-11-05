import app from "./app";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Carrega o arquivo .env correto com base no NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || "local"}`;
dotenv.config({ path: envFile });

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined");
}

if (!PORT) {
  throw new Error("PORT is not defined");
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(
        `Server is running on port ${PORT} - ${process.env.NODE_ENV}`
      );
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  });

// Tratamento de erros não capturados
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
