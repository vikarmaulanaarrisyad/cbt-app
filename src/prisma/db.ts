import 'dotenv/config';
import pg from 'pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

// Create resilient connection pool to PostgreSQL Supabase Database with high-concurrency settings
export const pgPool = new pg.Pool({
  connectionString,
  max: 20, // Max clients in pool, multiplexed via PgBouncer / Supavisor
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export interface FindManyOptions {
  where?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  limit?: number;
  offset?: number;
}

function createModelHelper(tableName: string) {
  return {
    async findMany(options?: FindManyOptions) {
      try {
        let sql = `SELECT * FROM "${tableName}"`;
        const values: any[] = [];
        const conditions: string[] = [];

        if (options?.where) {
          const keys = Object.keys(options.where).filter((k) => options.where![k] !== undefined);
          keys.forEach((key, idx) => {
            const val = options.where![key];
            if (val === null) {
              conditions.push(`"${key}" IS NULL`);
            } else if (Array.isArray(val)) {
              conditions.push(`"${key}" = ANY($${values.length + 1})`);
              values.push(val);
            } else {
              conditions.push(`"${key}" = $${values.length + 1}`);
              values.push(val);
            }
          });

          if (conditions.length > 0) {
            sql += ` WHERE ${conditions.join(' AND ')}`;
          }
        }

        if (options?.orderBy) {
          const orderKey = Object.keys(options.orderBy)[0];
          const dir = options.orderBy[orderKey]?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
          sql += ` ORDER BY "${orderKey}" ${dir}`;
        } else {
          sql += ` ORDER BY "createdAt" DESC`;
        }

        if (typeof options?.limit === 'number') {
          sql += ` LIMIT ${options.limit}`;
        }
        if (typeof options?.offset === 'number') {
          sql += ` OFFSET ${options.offset}`;
        }

        const res = await pgPool.query(sql, values);
        return res.rows;
      } catch (err: any) {
        console.error(`[DB Helper] Error findMany on ${tableName}:`, err?.message);
        return [];
      }
    },

    async count(options?: { where?: Record<string, any> }) {
      try {
        let sql = `SELECT COUNT(*) FROM "${tableName}"`;
        const values: any[] = [];
        const conditions: string[] = [];

        if (options?.where) {
          const keys = Object.keys(options.where).filter((k) => options.where![k] !== undefined);
          keys.forEach((key) => {
            const val = options.where![key];
            if (val === null) {
              conditions.push(`"${key}" IS NULL`);
            } else if (Array.isArray(val)) {
              conditions.push(`"${key}" = ANY($${values.length + 1})`);
              values.push(val);
            } else {
              conditions.push(`"${key}" = $${values.length + 1}`);
              values.push(val);
            }
          });

          if (conditions.length > 0) {
            sql += ` WHERE ${conditions.join(' AND ')}`;
          }
        }

        const res = await pgPool.query(sql, values);
        return parseInt(res.rows[0]?.count || '0', 10);
      } catch (err: any) {
        console.error(`[DB Helper] Error count on ${tableName}:`, err?.message);
        return 0;
      }
    },

    async findUnique({ where }: { where: Record<string, any> }) {
      try {
        const key = Object.keys(where)[0];
        const val = where[key];
        const res = await pgPool.query(`SELECT * FROM "${tableName}" WHERE "${key}" = $1 LIMIT 1;`, [val]);
        return res.rows[0] || null;
      } catch (err: any) {
        console.error(`[DB Helper] Error findUnique on ${tableName}:`, err?.message);
        return null;
      }
    },

    async create({ data }: { data: Record<string, any> }) {
      const keys = Object.keys(data).filter((k) => data[k] !== undefined);
      const cols = keys.map((k) => `"${k}"`).join(', ');
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const values = keys.map((k) => data[k]);

      const sql = `INSERT INTO "${tableName}" (${cols}) VALUES (${placeholders}) RETURNING *;`;
      const res = await pgPool.query(sql, values);
      return res.rows[0];
    },

    async update({ where, data }: { where: Record<string, any>; data: Record<string, any> }) {
      const whereKey = Object.keys(where)[0];
      const whereVal = where[whereKey];

      const dataKeys = Object.keys(data).filter((k) => data[k] !== undefined);
      const setClause = dataKeys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
      const values = dataKeys.map((k) => data[k]);
      values.push(whereVal);

      const sql = `UPDATE "${tableName}" SET ${setClause}, "updatedAt" = NOW() WHERE "${whereKey}" = $${values.length} RETURNING *;`;
      const res = await pgPool.query(sql, values);
      return res.rows[0];
    },

    async delete({ where }: { where: Record<string, any> }) {
      const key = Object.keys(where)[0];
      const val = where[key];
      await pgPool.query(`DELETE FROM "${tableName}" WHERE "${key}" = $1;`, [val]);
      return true;
    },
  };
}

export const db: any = {
  school: createModelHelper('School'),
  School: createModelHelper('School'),
  user: createModelHelper('User'),
  User: createModelHelper('User'),
  student: createModelHelper('Student'),
  Student: createModelHelper('Student'),
  classGroup: createModelHelper('ClassGroup'),
  ClassGroup: createModelHelper('ClassGroup'),
  subject: createModelHelper('Subject'),
  Subject: createModelHelper('Subject'),
  question: createModelHelper('Question'),
  Question: createModelHelper('Question'),
  examToken: createModelHelper('ExamToken'),
  ExamToken: createModelHelper('ExamToken'),
  semester: createModelHelper('Semester'),
  Semester: createModelHelper('Semester'),
  integrityLog: createModelHelper('IntegrityLog'),
  IntegrityLog: createModelHelper('IntegrityLog'),
  pool: pgPool,
};
