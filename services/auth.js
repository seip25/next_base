/**
 * Authentication service handling JWT token operations using jose.
 */
export class Auth {
  /**
   * Retrieves TextEncoder encoded JWT secret from environment.
   * @returns {Uint8Array}
   */
  static getSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error("[Auth] JWT_SECRET must be at least 32 characters long.");
    }
    return new TextEncoder().encode(secret);
  }

  /**
   * Dynamically loads the jose package.
   * @returns {Promise<import('jose')>}
   */
  static async getJose() {
    try {
      return await import("jose");
    } catch {
      throw new Error(
        "[Auth] 'jose' package is not installed. Run: npm run cli  install:auth or npm i jose",
      );
    }
  }

  /**
   * Signs a payload into a JWT token string.
   * @param {Object} payload
   * @param {string} [expiresIn="7d"]
   * @returns {Promise<string>}
   */
  static async signJWT(payload, expiresIn = "7d") {
    const { SignJWT } = await Auth.getJose();
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(Auth.getSecret());
  }

  /**
   * Verifies a JWT token and returns parsed payload or null on failure.
   * @param {string} token
   * @returns {Promise<Object|null>}
   */
  static async verifyJWT(token) {
    try {
      const { jwtVerify } = await Auth.getJose();
      const { payload } = await jwtVerify(token, Auth.getSecret());
      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Decodes a JWT token without verification.
   * @param {string} token
   * @returns {Object|null}
   */
  static decodeJWT(token) {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const decoded = Buffer.from(parts[1], "base64url").toString("utf-8");
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}

export const signJWT = Auth.signJWT;
export const verifyJWT = Auth.verifyJWT;
export const decodeJWT = Auth.decodeJWT;
