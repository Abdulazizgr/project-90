import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://abdulazizisa579_db_user:IBbQw6aw8NnsysYu@cluster0.7mbwqf2.mongodb.net/project90?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);
const db = client.db('project90');

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET || 'project90_ultra_secure_super_secret_key_32_characters_minimum',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
});
