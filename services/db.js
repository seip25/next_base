/**
 * Database service wrapper around mysql2 connection pool.
 */
export class Database {
  constructor() {
    /** @type {any} */
    this.pool = null;
  }

  /**
   * Returns active connection pool or creates a new one.
   * @returns {Promise<any>}
   */
  async getPool() {
    if (!this.pool) {
      let mysql;
      try {
        mysql = (await import("mysql2/promise")).default;
      } catch {
        throw new Error(
          "[Database] 'mysql2' package is not installed. Run: npm run cli  install:db or npm i mysql2",
        );
      }

      this.pool = mysql.createPool({
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT) || 3306,
        database: process.env.DB_NAME || "next_base",
        user: process.env.DB_USER || "next_base",
        password: process.env.DB_PASSWORD || "",
        waitForConnections: true,
        connectionLimit: 20,
        queueLimit: 0,
        timezone: "+00:00",
      });
    }
    return this.pool;
  }

  /**
   * Executes a SELECT query returning all matching rows.
   * @param {string} sql
   * @param {Array<any>} [values]
   * @returns {Promise<Array<any>>}
   */
  async query(sql, values = []) {
    const pool = await this.getPool();
    const [rows] = await pool.query(sql, values);
    return rows;
  }

  /**
   * Executes a SELECT query returning the first matching row or null.
   * @param {string} sql
   * @param {Array<any>} [values]
   * @returns {Promise<any|null>}
   */
  async queryOne(sql, values = []) {
    const rows = await this.query(sql, values);
    return rows[0] ?? null;
  }

  /**
   * Executes an INSERT, UPDATE or DELETE query.
   * @param {string} sql
   * @param {Array<any>} [values]
   * @returns {Promise<any>}
   */
  async execute(sql, values = []) {
    const pool = await this.getPool();
    const [result] = await pool.execute(sql, values);
    return result;
  }

  /**
   * Runs queries inside a managed SQL transaction.
   * @param {function(any): Promise<any>} fn
   * @returns {Promise<any>}
   */
  async transaction(fn) {
    const pool = await this.getPool();
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
      const result = await fn(conn);
      await conn.commit();
      return result;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Closes active connection pool.
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

export const db = new Database();
