/**
 * Cookie manager class for Next.js server components and route handlers.
 */
export class Cookies {
  /**
   * Helper to retrieve Next.js cookies store dynamically.
   * @returns {Promise<any>}
   */
  static async getStore() {
    try {
      const { cookies } = await import("next/headers");
      return await cookies();
    } catch {
      throw new Error("[Cookies] 'Cookies' service can only be used within Next.js Server Components, Actions, or Route Handlers.");
    }
  }

  /**
   * Returns default cookie options based on active environment.
   * @returns {Object}
   */
  static getDefaultOptions() {
    const isProd = process.env.MODE === "production" || process.env.NODE_ENV === "production";
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      path: "/",
    };
  }

  /**
   * Sets a cookie on the outgoing HTTP response.
   * @param {string} name
   * @param {string} value
   * @param {Object} [options]
   * @returns {Promise<void>}
   */
  static async set(name, value, options = {}) {
    const store = await Cookies.getStore();
    const mergedOptions = { ...Cookies.getDefaultOptions(), ...options };
    store.set(name, value, mergedOptions);
  }

  /**
   * Reads a cookie from incoming HTTP request.
   * @param {string} name
   * @returns {Promise<string|undefined>}
   */
  static async get(name) {
    const store = await Cookies.getStore();
    const cookie = store.get(name);
    return cookie?.value;
  }

  /**
   * Checks if a cookie exists.
   * @param {string} name
   * @returns {Promise<boolean>}
   */
  static async has(name) {
    const store = await Cookies.getStore();
    return store.has(name);
  }

  /**
   * Deletes a cookie.
   * @param {string} name
   * @returns {Promise<void>}
   */
  static async delete(name) {
    const store = await Cookies.getStore();
    store.delete(name);
  }

  /**
   * Retrieves all cookies.
   * @returns {Promise<Array<Object>>}
   */
  static async getAll() {
    const store = await Cookies.getStore();
    return store.getAll();
  }
}
