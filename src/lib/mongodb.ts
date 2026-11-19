import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://abdulazizisa579_db_user:CFznzmDGKaVSLBDL@cluster0.krg3uvc.mongodb.net/project90';
const options = {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 10000,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri, options);
    global._mongoClientPromise = global._mongoClient.connect();
  }
  client = global._mongoClient;
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export { client };
export default clientPromise;

export async function getDatabase(dbName = 'project90') {
  const c = await clientPromise;
  return c.db(dbName);
}
