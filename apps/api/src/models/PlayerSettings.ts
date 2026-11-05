import mongoose, { Schema, Document } from "mongoose";

export interface UserSettingsDocument extends Document {
  playerId: mongoose.Types.ObjectId;
  allowCookies: boolean;
  animations: {
    enabled: boolean;
    transitionDuration: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSettingsSchema = new Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
      unique: true,
    },
    allowCookies: {
      type: Boolean,
      default: false,
    },
    animations: {
      enabled: {
        type: Boolean,
        default: true,
      },
      transitionDuration: {
        type: Number,
        default: 2.0, // Valor padrão é 2 segundos
        min: 0,       // Sem animação
        max: 2.0,     // Máximo permitido
      },
    },
  },
  { timestamps: true }
);

const UserSettings = mongoose.model<UserSettingsDocument>(
  "UserSettings",
  userSettingsSchema
);

export default UserSettings; 