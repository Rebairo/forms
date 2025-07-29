# Employee KPI Details Form with SMTP Email

A comprehensive Employee KPI (Key Performance Indicator) tracking form that automatically sends submissions via email using SMTP.

## Features

- ✨ Modern, responsive form design
- 📧 SMTP email integration for form submissions
- 💾 Auto-save draft functionality
- ✅ Real-time form validation
- 📱 Mobile-friendly interface
- 🎨 Professional email templates (HTML + Plain text)
- 🔒 Secure SMTP authentication

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure SMTP Settings

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file with your SMTP configuration:

#### For Gmail:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
RECIPIENT_EMAIL=recipient@example.com
```

**Important for Gmail users:**
- Enable 2-factor authentication on your Google account
- Generate an App Password at: https://myaccount.google.com/apppasswords
- Use the App Password (not your regular password) in `SMTP_PASS`

#### For Other Email Providers:

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### 3. Start the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Form Fields

The form captures comprehensive KPI data including:

### Personal and Period Details
- Employee Name & ID
- Reporting Period (Start/End dates)
- Time allocation percentages

### Data Engineering Items
- Data pipelines worked on
- Error and incident logs
- Data quality checks
- Job performance metrics
- SLA compliance

### Frontend Development Items
- Features/tasks completed
- Performance metrics
- Bug and error logs
- User interaction data

### DevOps Items
- Deployment logs
- Change and cycle details
- Incident response logs
- Infrastructure metrics

### Additional Tracking
- Time allocation logs
- Self-assessment and feedback
- Supporting evidence

## Email Templates

The system generates both HTML and plain text versions of submitted forms:

- **HTML Email**: Professional, styled template with organized sections
- **Plain Text**: Fallback version for email clients that don't support HTML

## API Endpoints

- `GET /` - Serve the form page
- `POST /submit-form` - Handle form submissions and send emails
- `GET /health` - Health check endpoint

## Security Features

- Input validation and sanitization
- SMTP authentication
- Error handling with user-friendly messages
- Environment variable protection

## Troubleshooting

### Common SMTP Issues:

1. **Authentication Failed**: 
   - Verify your email credentials
   - For Gmail, ensure you're using an App Password
   - Check if 2FA is enabled

2. **Connection Failed**:
   - Verify SMTP host and port settings
   - Check firewall/network restrictions
   - Ensure your email provider allows SMTP access

3. **Email Not Received**:
   - Check spam/junk folders
   - Verify recipient email address
   - Check email provider's sending limits

### Testing SMTP Configuration:

You can test your SMTP settings using the health endpoint:
```bash
curl http://localhost:3000/health
```

## Development

The project structure:
```
├── index.html          # Main form page
├── script.js          # Frontend JavaScript
├── styles.css         # Form styling
├── server.js          # Backend server with SMTP
├── package.json       # Dependencies
├── .env              # SMTP configuration (create from .env.example)
└── README.md         # This file
```

## License

This project is licensed under the ISC License.
