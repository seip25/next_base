/**
 * Background Jobs Queue Service wrapper around BullMQ and ioredis.
 */
export class QueueService {
  constructor(queueName = "default") {
    this.queueName = queueName;
    /** @type {any} */
    this._connection = null;
    /** @type {any} */
    this._queue = null;
    /** @type {any} */
    this._queueEvents = null;
  }

  /**
   * Dynamically loads bullmq and ioredis packages.
   * @returns {Promise<{ bullmq: any, Redis: any }>}
   */
  async getLibs() {
    try {
      const bullmq = await import("bullmq");
      const ioredisModule = await import("ioredis");
      const Redis = ioredisModule.default || ioredisModule;
      return { bullmq, Redis };
    } catch {
      throw new Error(
        "[Queue] 'bullmq' and 'ioredis' packages are not installed. Run: npm run cli install:queue or npm i bullmq ioredis"
      );
    }
  }

  /**
   * Lazily initializes and returns the ioredis connection instance.
   * @returns {Promise<any>}
   */
  async getConnection() {
    if (!this._connection) {
      const { Redis } = await this.getLibs();
      this._connection = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || "",
        maxRetriesPerRequest: null,
      });
    }
    return this._connection;
  }

  /**
   * Lazily initializes and returns the BullMQ Queue instance.
   * @returns {Promise<any>}
   */
  async getQueue() {
    if (!this._queue) {
      const { bullmq } = await this.getLibs();
      const connection = await this.getConnection();
      this._queue = new bullmq.Queue(this.queueName, { connection });
    }
    return this._queue;
  }

  /**
   * Dispatches a job to the queue.
   * @param {string} name 
   * @param {object} [data={}] 
   * @param {object} [opts={}] 
   * @returns {Promise<any>}
   */
  async dispatch(name, data = {}, opts = {}) {
    const q = await this.getQueue();
    return await q.add(name, data, opts);
  }

  /**
   * Schedules a recurring cron job.
   * @param {string} name 
   * @param {object} data 
   * @param {string} cronExpression 
   * @returns {Promise<any>}
   */
  async schedule(name, data, cronExpression) {
    const q = await this.getQueue();
    return await q.add(name, data, {
      repeat: { pattern: cronExpression },
    });
  }

  /**
   * Creates a BullMQ worker listener.
   * @param {function} processor 
   * @param {object} [opts={}] 
   * @returns {Promise<any>}
   */
  async createWorker(processor, opts = {}) {
    const { bullmq } = await this.getLibs();
    const connection = await this.getConnection();
    return new bullmq.Worker(this.queueName, processor, { connection, ...opts });
  }
}

export const queue = new QueueService();
export default queue;

