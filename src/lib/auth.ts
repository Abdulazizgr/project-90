import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { client } from '@/lib/mongodb';

const db = client.db('project90');

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
    transaction: false,
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET || 'project90_ultra_secure_super_secret_key_32_characters_minimum',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
});

