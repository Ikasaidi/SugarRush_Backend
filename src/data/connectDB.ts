import dotenv from "dotenv";
import mongoose from "mongoose";
import config from "config";

dotenv.config();

export const connectDB = async () => {
  try {
    // --- Connexion MongoDB --- //
    const uri = config.get<string>("db.uri");
    console.log("Connexion vers" , uri)
    await mongoose.connect(uri);
    console.log("MongoDB est connecté avec succès");


  } catch (error) {
    console.error("MongoDB n’a pas pu se connecter :", error);
    process.exit(1);
  }
};
 
