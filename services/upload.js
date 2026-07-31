import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { randomBytes } from "crypto";

/**
 * File upload handler class supporting native Web API FormData and multer.
 */
export class Upload {
  /**
   * Dynamically loads multer package.
   * @param {Object} [options]
   * @returns {Promise<any>}
   */
  static async getMulter(options = {}) {
    try {
      const multerModule = await import("multer");
      const multer = multerModule.default || multerModule;
      return multer(options);
    } catch {
      throw new Error(
        "[Upload] 'multer' package is not installed. Run: npm run cli  install:upload or npm i multer",
      );
    }
  }

  /**
   * Parses native Web API Request FormData in Next.js Route Handlers and Server Actions.
   * @param {Request} request
   * @returns {Promise<{ fields: Object, files: Array<{ name: string, filename: string, mimeType: string, size: number, buffer: Buffer }> }>}
   */
  static async parseFormData(request) {
    const formData = await request.formData();
    const fields = {};
    const files = [];

    for (const [key, value] of formData.entries()) {
      if (value && typeof value === "object" && "arrayBuffer" in value) {
        const fileObj = /** @type {File} */ (value);
        const arrayBuffer = await fileObj.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        files.push({
          name: key,
          filename: fileObj.name,
          mimeType: fileObj.type,
          size: fileObj.size,
          buffer,
        });
      } else {
        fields[key] = value;
      }
    }

    return { fields, files };
  }

  /**
   * Saves a file buffer or Web File object to the local disk.
   * @param {Buffer|File|{ buffer: Buffer, filename: string }} file
   * @param {string} [targetDir="public/uploads"]
   * @param {string} [customName]
   * @returns {Promise<{ path: string, url: string, filename: string, size: number }>}
   */
  static async saveFile(file, targetDir = "public/uploads", customName) {
    const uploadPath = join(process.cwd(), targetDir);
    await mkdir(uploadPath, { recursive: true });

    let buffer;
    let originalName = "file";

    if ("buffer" in file && Buffer.isBuffer(file.buffer)) {
      buffer = file.buffer;
      originalName = file.filename || "file";
    } else if (Buffer.isBuffer(file)) {
      buffer = file;
    } else if (
      "arrayBuffer" in file &&
      typeof file.arrayBuffer === "function"
    ) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      originalName = file.name || "file";
    } else {
      throw new Error("[Upload] Invalid file format provided to saveFile.");
    }

    const extension = extname(originalName) || ".bin";
    const uniqueSuffix = randomBytes(16).toString("hex");
    const filename = customName || `${uniqueSuffix}${extension}`;
    const filePath = join(uploadPath, filename);

    await writeFile(filePath, buffer);

    const publicUrl = `/${targetDir.replace(/^public\//, "")}/${filename}`;

    return {
      path: filePath,
      url: publicUrl,
      filename,
      size: buffer.length,
    };
  }
}
