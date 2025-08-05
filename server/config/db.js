import dotenv from 'dotenv';
dotenv.config();

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

(async () => {
  try {
    await sql`SELECT 1`; 
    console.log('Postgres connected successfully');
  } catch (error) {
    console.error('Postgres connection failed:', error);
  }
})();

export default sql;
