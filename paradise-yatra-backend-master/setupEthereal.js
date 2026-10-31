const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function setup() {
    let testAccount = await nodemailer.createTestAccount();
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Remove old SMTP settings if any
    envContent = envContent.replace(/SMTP_HOST=.*\n?/g, '');
    envContent = envContent.replace(/SMTP_PORT=.*\n?/g, '');
    envContent = envContent.replace(/SMTP_USER=.*\n?/g, '');
    envContent = envContent.replace(/SMTP_PASS=.*\n?/g, '');
    
    // Append new settings
    envContent += `\nSMTP_HOST=${testAccount.smtp.host}\n`;
    envContent += `SMTP_PORT=${testAccount.smtp.port}\n`;
    envContent += `SMTP_USER=${testAccount.user}\n`;
    envContent += `SMTP_PASS=${testAccount.pass}\n`;
    
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    console.log('Ethereal account created and saved to .env');
    console.log(`User: ${testAccount.user}`);
    console.log(`Pass: ${testAccount.pass}`);
}

setup().catch(console.error);
