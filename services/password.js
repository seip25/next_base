/**
 * Password hashing and verification service using bcryptjs.
 */
export class Password {
  /**
   * Dynamically loads the bcryptjs module.
   * @returns {Promise<import('bcryptjs')>}
   */
  static async getBcrypt() {
    try {
      const module = await import("bcryptjs");
      return module.default || module;
    } catch {
      throw new Error(
        "[Password] 'bcryptjs' package is not installed. Run: npm run cli  install:bcrypt or npm i bcryptjs",
      );
    }
  }

  /**
   * Hashes a plaintext password string.
   * @param {string} plainText
   * @param {number} [saltRounds=10]
   * @returns {Promise<string>}
   */
  static async hash(plainText, saltRounds = 10) {
    const bcrypt = await Password.getBcrypt();
    return bcrypt.hash(plainText, saltRounds);
  }

  /**
   * Compares a plaintext password string with an existing bcrypt hash.
   * @param {string} plainText
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  static async compare(plainText, hash) {
    const bcrypt = await Password.getBcrypt();
    return bcrypt.compare(plainText, hash);
  }

  /**
   * Generates a random salt string.
   * @param {number} [saltRounds=10]
   * @returns {Promise<string>}
   */
  static async genSalt(saltRounds = 10) {
    const bcrypt = await Password.getBcrypt();
    return bcrypt.genSalt(saltRounds);
  }
}

export const hashPassword = Password.hash;
export const comparePassword = Password.compare;
