import { cache } from "./cache.js";

/**
 * Rate limiting service utilizing Redis cache.
 */
export class RateLimit {
  /**
   * @param {Request} req
   * @param {string} action
   * @param {number} [max=5]
   * @param {number} [windowInSeconds=60]
   * @returns {Promise<boolean>}
   */
  static async check(req, action, max = 5, windowInSeconds = 60) {
    let ip = "127.0.0.1";
    if (req && typeof req.headers?.get === "function") {
      ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    }

    const key = `ratelimit:${action}:${ip}`;
    const client = await cache.getClient();
    const current = await client.get(key);
    
    if (current && parseInt(current) >= max) {
      return false;
    }
    
    if (!current) {
      await client.setEx(key, windowInSeconds, "1");
    } else {
      await client.incr(key);
    }
    
    return true;
  }
}
