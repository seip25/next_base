export class Cache {
  constructor() {
    this.client = null;
    this.connecting = false;
    this.useMemory = false;
    this.memoryStore = new Map();
  }

  async getClient() {
    if (this.useMemory) return null;
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
      console.warn("[Cache] 'redis' package not found. Falling back to In-Memory store.");
      this.useMemory = true;
      this.connecting = false;
      return null;
    }

    const password = process.env.REDIS_PASSWORD;
    const host = process.env.REDIS_HOST || "127.0.0.1";
    const port = process.env.REDIS_PORT || 6379;
    const url = password
      ? `redis://:${password}@${host}:${port}`
      : `redis://${host}:${port}`;

    try {
      this.client = createClient({
        url,
        socket: {
          connectTimeout: 2000,
          reconnectStrategy: (retries) => {
            if (retries > 1) return new Error("Redis connection failed");
            return 300;
          },
        },
      });

      this.client.on("error", () => {});
      await this.client.connect();
    } catch (err) {
      console.warn(`[Cache] Redis connection failed (${err.message}). Falling back to In-Memory store.`);
      this.client = null;
      this.useMemory = true;
    }

    this.connecting = false;
    return this.client;
  }

  async get(key) {
    const client = await this.getClient();
    if (!client) {
      const item = this.memoryStore.get(key);
      if (!item) return null;
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.memoryStore.delete(key);
        return null;
      }
      return item.value;
    }

    try {
      const value = await client.get(key);
      if (value === null) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch {
      return null;
    }
  }

  async set(key, value, ttlSeconds) {
    const client = await this.getClient();
    if (!client) {
      const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
      this.memoryStore.set(key, { value, expiresAt });
      return;
    }

    try {
      const serialized =
        typeof value === "string" ? value : JSON.stringify(value);
      if (ttlSeconds) {
        await client.setEx(key, ttlSeconds, serialized);
      } else {
        await client.set(key, serialized);
      }
    } catch {}
  }

  async del(keys) {
    const client = await this.getClient();
    const keyList = Array.isArray(keys) ? keys : [keys];
    if (!client) {
      keyList.forEach((k) => this.memoryStore.delete(k));
      return;
    }

    try {
      if (keyList.length > 0) {
        await client.del(keyList);
      }
    } catch {}
  }

  async expire(key, ttlSeconds) {
    const client = await this.getClient();
    if (!client) {
      const item = this.memoryStore.get(key);
      if (item) {
        item.expiresAt = Date.now() + ttlSeconds * 1000;
      }
      return;
    }

    try {
      await client.expire(key, ttlSeconds);
    } catch {}
  }

  async invalidatePattern(pattern) {
    const client = await this.getClient();
    if (!client) {
      const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
      for (const key of this.memoryStore.keys()) {
        if (regex.test(key)) {
          this.memoryStore.delete(key);
        }
      }
      return;
    }

    try {
      let cursor = 0;
      do {
        const result = await client.scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = result.cursor;
        if (result.keys.length > 0) {
          await client.del(result.keys);
        }
      } while (cursor !== 0);
    } catch {}
  }

  async remember(key, ttlSeconds, fn) {
    const cached = await this.get(key);
    if (cached !== null) return cached;
    const value = await fn();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async disconnect() {
    if (this.client?.isReady) {
      await this.client.disconnect();
      this.client = null;
    }
    this.memoryStore.clear();
  }
}

export const cache = new Cache();
