import mongoose from 'mongoose';
import config from 'config';

export async function connectToMongo() {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.get('dbUri'));
    console.log('Connected to MongoDB database.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
