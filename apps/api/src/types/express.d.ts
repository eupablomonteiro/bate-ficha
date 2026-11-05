import { PlayerDocument } from "../models/Player";
import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    player?: PlayerDocument;
    params: any;
    body: any;
    query: any;
    file: any;
    header: (name: string) => string | undefined;
  }
}