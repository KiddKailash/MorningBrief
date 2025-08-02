/**
 * Email Integration
 * 
 * Simple email sender using nodemailer
 */

import nodemailer from 'nodemailer';
import { settings } from '../config/settings';

interface EmailOptions {
  subject: string;
  recipients: string[];
  html: string;
  plainText: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: settings.email.address,
        pass: settings.email.password
      }
    });
  }
  
  /**
   * Send newsletter to recipients
   */
  async sendNewsletter(options: EmailOptions): Promise<void> {
    const { subject, recipients, html, plainText } = options;
    
    // Send to each recipient individually (for privacy)
    for (const recipient of recipients) {
      try {
        await this.transporter.sendMail({
          from: `${process.env['NEWSLETTER_NAME'] || 'Newsletter'} <${settings.email.address}>`,
          to: recipient,
          subject,
          text: plainText,
          html
        });
        
        console.log(`✅ Sent to ${recipient}`);
        
      } catch (error) {
        console.error(`❌ Failed to send to ${recipient}:`, error);
      }
    }
  }
  
  /**
   * Send test email
   */
  async sendTest(html: string): Promise<void> {
    await this.sendNewsletter({
      subject: 'Test Newsletter',
      recipients: [settings.email.address],
      html,
      plainText: 'Test newsletter content'
    });
  }
  
  /**
   * Verify email configuration
   */
  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email configuration verified');
      return true;
    } catch (error) {
      console.error('❌ Email configuration error:', error);
      return false;
    }
  }
}

export const emailer = new EmailService();