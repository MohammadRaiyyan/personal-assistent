import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.ts';

const db = drizzle({
    connection: {
        connectionString: process.env.DATABASE_URL!,
        ssl: true
    },
    schema,
});

export default db;