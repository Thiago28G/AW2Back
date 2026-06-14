import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);

async function conectarDB() {
    await client.connect();
    return client.db(process.env.MONGO_DB);
}

export { conectarDB, client };
