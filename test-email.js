const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailConfiguration() {
    console.log('🧪 Testing SMTP Email Configuration...\n');
    
    try {
        // Create transporter
        const transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        console.log('📋 Configuration:');
        console.log(`   Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
        console.log(`   Port: ${process.env.SMTP_PORT || 587}`);
        console.log(`   User: ${process.env.SMTP_USER || 'Not configured'}`);
        console.log(`   Recipient: ${process.env.RECIPIENT_EMAIL || 'Not configured'}\n`);

        // Verify connection
        console.log('🔍 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully!\n');

        // Send test email
        console.log('📧 Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.RECIPIENT_EMAIL || process.env.SMTP_USER,
            subject: 'KPI Form - SMTP Test Email',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #4f46e5; color: white; padding: 20px; text-align: center;">
                        <h1>🎉 SMTP Test Successful!</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p>Congratulations! Your SMTP configuration is working correctly.</p>
                        <p>The Employee KPI Form is now ready to send email submissions.</p>
                        <hr style="margin: 20px 0; border: 1px solid #e5e7eb;">
                        <p style="color: #666; font-size: 14px;">
                            This is a test email sent from your KPI form application.<br>
                            Time: ${new Date().toLocaleString()}
                        </p>
                    </div>
                </div>
            `,
            text: `
SMTP Test Successful!

Congratulations! Your SMTP configuration is working correctly.
The Employee KPI Form is now ready to send email submissions.

This is a test email sent from your KPI form application.
Time: ${new Date().toLocaleString()}
            `
        });

        console.log('✅ Test email sent successfully!');
        console.log(`📬 Message ID: ${info.messageId}\n`);
        
        console.log('🎉 All tests passed! Your email configuration is ready.');
        console.log('💡 You can now start the server with: npm start');

    } catch (error) {
        console.error('❌ Email configuration test failed:\n');
        
        if (error.code === 'EAUTH') {
            console.error('🔐 Authentication Error:');
            console.error('   - Check your email and password in .env file');
            console.error('   - For Gmail, use an App Password instead of your regular password');
            console.error('   - Enable 2-factor authentication and generate an App Password at:');
            console.error('     https://myaccount.google.com/apppasswords');
        } else if (error.code === 'ECONNECTION') {
            console.error('🌐 Connection Error:');
            console.error('   - Check your SMTP host and port settings');
            console.error('   - Verify your internet connection');
            console.error('   - Check if your firewall is blocking the connection');
        } else if (error.code === 'EENVELOPE') {
            console.error('📧 Email Address Error:');
            console.error('   - Check your SMTP_USER and RECIPIENT_EMAIL settings');
            console.error('   - Make sure email addresses are valid');
        } else {
            console.error('🔧 Configuration Error:');
            console.error(`   ${error.message}`);
        }
        
        console.error('\n💡 Tips:');
        console.error('   1. Copy .env.example to .env and configure your settings');
        console.error('   2. Make sure all required environment variables are set');
        console.error('   3. Check the README.md for detailed setup instructions');
        
        process.exit(1);
    }
}

// Run the test
testEmailConfiguration();