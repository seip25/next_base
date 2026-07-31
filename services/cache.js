/**
 * Cache service wrapper around Redis client.
 */
export class Cache {
  constructor() {
    /** @type {any} */
    this.client = null;
    this.connecting = false;
  }

  /**
   * Initializes and connects Redis client if not already connected.
   * @returns {Promise<any>}
   */
  async getClient() {
    if (this.client?.isReady) return this.client;

    if (this.connecting) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.getClient();
    }

    this.connecting = true;

    let createClient;
    try {
      const redisModule = await import("redis");
      createClient = redisModule.createClient;
    } catch {
      this.connecting = false;
      throw new Error(
        "[Cache] 'redis' package is not installed. Run: npm run cli  install:cache or npm i redis",
      );
    }

    const password = process.env.REDIS_PASSWORD;
    const host = process.env.REDIS_HOST || "127.0.0.1";
    const port = process.env.REDIS_PORT || 6379;
    const url = password
      ? `redis://:${password}@${host}:${port}`
      : `redis://${host}:${port}`;

    this.client = createClient({ url });
    this.client.on("error", (err) =>
      console.error("[Cache] Redis error:", err),
    );
    await this.client.connect();
    this.connecting = false;

    return this.client;
  }

  /**
   * Retrieves a cached value by key.
   * @param {string} key
   * @returns {Promise<any|null>}
   */
  async get(key) {
    const client = await this.getClient();
    const value = await client.get(key);
    if (value === null) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  /**
   * Stores a value in cache with optional TTL.
   * @param {string} key
   * @param {any} value
   * @param {number} [ttlSeconds]
   * @returns {Promise<void>}
   */
  async set(key, value, ttlSeconds) {
    const client = await this.getClient();
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await client.setEx(key, ttlSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
  }

  /**
   * Deletes one or multiple keys from cache.
   * @param {string|Array<string>} keys
   * @returns {Promise<void>}
   */
  async del(keys) {
    const client = await this.getClient();
    const keyList = Array.isArray(keys) ? keys : [keys];
    if (keyList.length > 0) {
      await client.del(keyList);
    }
  }

  /**
   * Sets TTL expiration on a key.
   * @param {string} key
   * @param {number} ttlSeconds
   * @returns {Promise<void>}
   */
  async expire(key, ttlSeconds) {
    const client = await this.getClient();
    await client.expire(key, ttlSeconds);
  }

  /**
   * Invalidates all keys matching a glob pattern using SCAN.
   * @param {string} pattern
   * @returns {Promise<void>}
   */
  async invalidatePattern(pattern) {
    const client = await this.getClient();
    let cursor = 0;
    do {
      const result = await client.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = result.cursor;
      if (result.keys.length > 0) {
        await client.del(result.keys);
      }
    } while (cursor !== 0);
  }

  /**
   * Returns cached value or executes fn and caches result.
   * @param {string} key
   * @param {number} ttlSeconds
   * @param {function(): Promise<any>} fn
   * @returns {Promise<any>}
   */
  async remember(key, ttlSeconds, fn) {
    const cached = await this.get(key);
    if (cached !== null) return cached;
    const value = await fn();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  /**
   * Disconnects Redis client.
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.client?.isReady) {
      await this.client.disconnect();
      this.client = null;
    }
  }
}

export const cache = new Cache();
