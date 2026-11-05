import multer from "multer";

const storage = multer.memoryStorage(); // Armazena o arquivo na memória
const upload = multer({ storage });

export const uploadMiddleware = upload.single("avatar");