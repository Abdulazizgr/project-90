import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://abdulazizisa579_db_user:IBbQw6aw8NnsysYu@cluster0.7mbwqf2.mongodb.net/project90?retryWrites=true&w=majority&appName=Cluster0';
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI && process.env.NODE_ENV === 'production') {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDatabase(dbName = 'project90') {
  const client = await clientPromise;
  return client.db(dbName);
}
