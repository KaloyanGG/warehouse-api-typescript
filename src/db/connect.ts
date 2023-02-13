import mongoose from "mongoose";
import logger from "../utils/logger";
import dotenv from "dotenv";

dotenv.config();
export default async function connectToMongoDB() {
    mongoose.set('strictQuery', false);
    await mongoose.connect(`${process.env.db_url}/${process.env.db_name}`);
    logger.log('Connected to MongoDBB successfully');
}