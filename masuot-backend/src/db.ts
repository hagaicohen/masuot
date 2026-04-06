import { Pool } from 'pg';

const pool = new Pool({
  host:     'aws-1-ap-northeast-1.pooler.supabase.com',
  port:     5432,
  database: 'postgres',
  user:     'postgres.jhkxyiiwtxtgqxovljkl',
  password: '__Por@t2019!',
  ssl:      { rejectUnauthorized: false }
});

// 🔥 INIT פעם אחת לכל האפליקציה
let __dbInitialized = false;

export async function initDB() {
  if (!__dbInitialized) {
    console.time('DB INIT');
    await pool.query('SELECT 1');
    console.timeEnd('DB INIT');
    __dbInitialized = true;
  }
}

export default pool;