import nodemailer from "nodemailer";

/**
 * Mailer service for sending emails via SMTP.
 */
export class Mailer {
  /**
   * @returns {nodemailer.Transporter}
   */
  static getTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * @param {string} to
   * @param {string} subject
   * @param {string} html
   * @param {string} [from]
   * @returns {Promise<any>}
   */
  static async send(to, subject, html, from = process.env.SMTP_FROM) {
    const transporter = Mailer.getTransporter();
    return await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
  }
}
