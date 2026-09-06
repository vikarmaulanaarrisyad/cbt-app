import 'dotenv/config';
import pg from 'pg';

async function main() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pool = new pg.Pool({ connectionString: url });

  try {
    const res = await pool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema');
    `);
    console.log('All user tables:', res.rows);
  } catch (err: any) {
    console.error('Error:', err?.message || err);
  } finally {
    await pool.end();
  }
}

main().then(() => process.exit(0));
