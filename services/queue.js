const { Queue, Worker, QueueEvents } = require("bullmq");
const Redis = require("ioredis");

const connection = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || "",
  maxRetriesPerRequest: null,
});

class QueueService {
  constructor(queueName = "default") {
    this.queueName = queueName;
    this.queue = new Queue(queueName, { connection });
    this.queueEvents = new QueueEvents(queueName, { connection });
  }

  /**
   * @param {string} name 
   * @param {object} data 
   * @param {object} opts 
   */
  async dispatch(name, data = {}, opts = {}) {
    return await this.queue.add(name, data, opts);
  }

  /**
   * @param {string} name 
   * @param {object} data 
   * @param {string} cronExpression 
   */
  async schedule(name, data, cronExpression) {
    return await this.queue.add(name, data, {
      repeat: { pattern: cronExpression },
    });
  }

  /**
   * @param {function} processor 
   * @param {object} opts 
   */
  createWorker(processor, opts = {}) {
    return new Worker(this.queueName, processor, { connection, ...opts });
  }
}

const queue = new QueueService();

module.exports = {
  queue,
  QueueService,
  connection,
};
