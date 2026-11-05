import mongoose, { Document, Schema } from "mongoose";

export interface IMatch extends Document {
  players: string[];
  gametype: "bolinho" | "par_ou_impar";
  gamemode: "parceirada" | "cara_a_cara";
  teamA: string[];
  teamB: string[];
  finalizer: string;
  winner?: string;
  status: "running" | "finished";
  createdAt: Date;
  updatedAt: Date;
}

const matchSchema: Schema = new Schema({
  players: { type: [String], ref: "Player", required: true },
  gametype: { type: String, enum: ["bolinho", "par_ou_impar"], required: true },
  gamemode: { type: String, enum: ["parceirada", "cara_a_cara"], required: true },
  teamA: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  teamB: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  finalizer: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  winner: { type: String, enum: ["none", "teamA", "teamB"], default: "none" },
  status: { type: String, enum: ["running", "finished"], default: "running" },
}, { timestamps: true });

matchSchema.pre("save", function (next) {
  if (this.isModified("winner") && this.winner !== "none") {
    this.status = "finished";
  }
  next();
});

export default mongoose.model<IMatch>("Match", matchSchema);
