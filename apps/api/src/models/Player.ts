import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const playerSchema = new Schema({
  name: { type: String, required: true },
  nickname: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String, default: "https://res.cloudinary.com/bate-ficha/image/upload/v1739682812/bcb7950fee4cbc1c41e4fd82b99943af_zzewtv.jpg" },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  pointsSolo: { type: Number, default: 150 },
  pointsTeam: { type: Number, default: 150 },
  totalMatchesSolo: { type: Number, default: 0 },
  totalMatchesTeam: { type: Number, default: 0 },
  soloWins: { type: Number, default: 0 },
  soloLosses: { type: Number, default: 0 },
  teamWins: { type: Number, default: 0 },
  teamLosses: { type: Number, default: 0 },
  partners: { type: Map, of: Number, default: new Map() },
});

playerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password as string, 8);
  }
  next();
});

playerSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
  return token;
};

export interface PlayerDocument extends Document {
  name: string;
  nickname: string;
  password: string;
  avatarUrl: string;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  pointsSolo: number;
  pointsTeam: number;
  totalMatchesSolo: number;
  totalMatchesTeam: number;
  soloWins: number;
  soloLosses: number;
  teamWins: number;
  teamLosses: number;
  partners: Map<string, number>;
  generateAuthToken(): string;
}

export default mongoose.model<PlayerDocument>("Player", playerSchema);
