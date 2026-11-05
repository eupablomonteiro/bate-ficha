import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Carrega o arquivo .env correto com base no NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || "local"}`;
dotenv.config({ path: envFile });

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error(`Não há configurações de CLOUDINARY em ${envFile}`);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;