import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  createNewsletterHTML,
  formatContentForEmail,
} from "../branding/emailTemplate.js";
import { brand } from "../branding/brand.js";

// Load all environment variables
dotenv.config();

// ~ Public Functions

export class EmailSender {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env["GMAIL_ADDRESS"],
        pass: process.env["GMAIL_APP_PASS"],
      },
    });
  }

  async sendNewsletter(newsletterContent: string): Promise<void> {
    console.log("[INFO] Starting newsletter email sending process...");

    try {
      // Create branded subject line
      const today = new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const subject = `${today} | ${brand.tagline}`;
      const previewText = `${brand.subtitle} - ${today}'s edition`;

      // Get subscriber list from environment variable (comma-separated emails)
      const subscribers =
        process.env["SUBSCRIBERS_LIST"]
          ?.split(",")
          .map((email) => email.trim()) || [];

      if (subscribers.length === 0) {
        console.error(
          "[ERROR] No subscribers found. Please set SUBSCRIBERS_LIST environment variable."
        );
        return;
      }

      // Convert plain text content to HTML and apply branding
      const formattedContent = formatContentForEmail(newsletterContent);

      // Create branded HTML email
      const htmlContent = createNewsletterHTML({
        subject,
        content: formattedContent,
        previewText,
      });

      const mailOptions = {
        from: `"${brand.name}" <${process.env["GMAIL_ADDRESS"]}>`,
        to: subscribers,
        subject: subject,
        html: htmlContent,
        // Also include plain text version
        text: newsletterContent,
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log(
        `[SUCCESS] Newsletter sent successfully to ${subscribers.length} subscriber(s)`
      );
      console.log(`[INFO] Message ID: ${info.messageId}`);
      console.log(`[INFO] Recipients: ${subscribers.join(", ")}`);
    } catch (error) {
      console.error("[ERROR] Error sending newsletter:", error);
      throw error;
    }
  }

  async validateEmailConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log("[SUCCESS] Email configuration is valid");
      return true;
    } catch (error) {
      console.error("[ERROR] Email configuration is invalid:", error);
      return false;
    }
  }
}

export const emailSender = new EmailSender();
