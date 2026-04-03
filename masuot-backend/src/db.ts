import { Pool } from 'pg';

const pool = new Pool({
  host:     'aws-1-ap-northeast-1.pooler.supabase.com',
  port:     5432,
  database: 'postgres',
  user:     'postgres.jhkxyiiwtxtgqxovljkl',
  password: '__Por@t2019!',
  ssl:      { rejectUnauthorized: false }
});

export default pool;