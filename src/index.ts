/**
 * Morning Brief Newsletter
 * 
 * Main entry point - simple and straightforward
 */

import { newsletter } from './newsletter/index';
import { validateSettings } from './config/settings';

async function main() {
  try {
    // Validate configuration
    validateSettings();
    
    // Parse command line arguments
    const command = process.argv[2];
    
    switch (command) {
      case 'preview':
        // Generate preview without sending
        const previewPath = await newsletter.preview();
        console.log(`\n📄 Preview saved to: ${previewPath}`);
        console.log('Open this file in your browser to view the newsletter.\n');
        break;
        
      case 'test':
        // Send test email to yourself
        console.log('📧 Sending test email...');
        const sections = await newsletter.getEditableSections();
        console.log('\nGenerated sections:', Object.keys(sections));
        break;
        
      case 'send':
      default:
        // Send newsletter to all subscribers
        await newsletter.send();
        console.log('\n🎉 Newsletter sent successfully!\n');
        break;
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { newsletter };