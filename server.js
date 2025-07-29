const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('.'));

// SMTP Configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // Your email
      pass: process.env.SMTP_PASS  // Your email password or app password
    }
  });
};

// Email template function
const generateEmailTemplate = (formData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .section { margin-bottom: 30px; }
        .section h3 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .field { margin-bottom: 15px; }
        .field-label { font-weight: bold; color: #374151; }
        .field-value { margin-top: 5px; padding: 10px; background: #f9fafb; border-radius: 5px; }
        .percentage { display: inline-block; background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 15px; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Employee KPI Details Submission</h1>
        <p>Performance tracking and evaluation report</p>
      </div>
      
      <div class="content">
        <div class="section">
          <h3>Personal and Period Details</h3>
          <div class="field">
            <div class="field-label">Employee Name:</div>
            <div class="field-value">${formData.employeeName || 'Not provided'}</div>
          </div>
          <div class="field">
            <div class="field-label">Employee ID:</div>
            <div class="field-value">${formData.employeeId || 'Not provided'}</div>
          </div>
          <div class="field">
            <div class="field-label">Reporting Period:</div>
            <div class="field-value">${formData.periodStart || 'Not provided'} to ${formData.periodEnd || 'Not provided'}</div>
          </div>
          <div class="field">
            <div class="field-label">Time Allocation:</div>
            <div class="field-value">
              Data Engineering: <span class="percentage">${formData.dataEngTime || '0'}%</span> | 
              Frontend DevOps: <span class="percentage">${formData.frontendDevOpsTime || '0'}%</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Data Engineering-Related Items</h3>
          <div class="field">
            <div class="field-label">Data Pipelines Worked On:</div>
            <div class="field-value">${formData.dataPipelines || 'Not provided'}</div>
          </div>
          <div class="field">
            <div class="field-label">Error and Incident Log:</div>
            <div class="field-value">${formData.errorIncidentLog || 'Not provided'}</div>
          </div>
          <div class="field">
            <div class="field-label">Data Quality Checks:</div>
            <div class="field-value">${formData.dataQualityChecks || 'Not provided'}</div>
          </div>
          <div class="field">
            <div class="field-label">Job Performance Metrics:</div>
            <div class="field-value">${formData.jobPerformanceMetrics || 'Not provided'}</div>
          </div>
          <div class="field">
            <div class="field-label">SLA Compliance:</div>
            <div class="field-value">${formData.slaCompliance || 'Not provided'}</div>
          </div>
        </div>

        <div class="section">
          <h3>Frontend Development-Related Items</h3>
          <div class="field">
            <div class="field-label">Features or Tasks Completed:</div>
            <div class="field-value">${formData.featuresCompleted || 'Not provided'}</div>
          </div>
          <div class="field">
            <div class="field-label">Performance Metrics:</div>
            <div class="field-value">${formData.performanceMetrics || 'Not provided'}</div>
          </div>
          <div class="field">
            <div class="field-label">Bug and Error Log:</div>
            <div class="field-value">${formData.bugErrorLog || 'Not provided'}</div>
          </div>
          <div class="field">
            <div class="field-label">User Interaction Data:</div>
            <div class="field-value">${formData.userInteractionData || 'Not provided'}</div>
          </div>
        </div>

        <div class="section">
          <h3>DevOps-Related Items</h3>
          <div class="field">
            <div class="field-label">Deployment Log:</div>
            <div class="field-value">${formData.deploymentLog || 'Not provided'}</div>
          </div>
          <div class="field">
            <div class="field-label">Change and Cycle Details:</div>
            <div class="field-value">${formData.changeCycleDetails || 'Not provided'}</div>
          </div>
          <div class="field">
            <div class="field-label">Incident Response Log:</div>
            <div class="field-value">${formData.incidentResponseLog || 'Not provided'}</div>
          </div>
          <div class="field">
            <div class="field-label">Infrastructure Metrics:</div>
            <div class="field-value">${formData.infrastructureMetrics || 'Not provided'}</div>
          </div>
        </div>

        <div class="section">
          <h3>Additional Items for Holistic Tracking</h3>
          <div class="field">
            <div class="field-label">Time Allocation Log:</div>
            <div class="field-value">${formData.timeAllocationLog || 'Not provided'}</div>
          </div>
          <div class="field">
            <div class="field-label">Self-Assessment and Feedback:</div>
            <div class="field-value">${formData.selfAssessment || 'Not provided'}</div>
          </div>
          <div class="field">
            <div class="field-label">Supporting Evidence:</div>
            <div class="field-value">${formData.supportingEvidence || 'Not provided'}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Form submission endpoint
app.post('/submit-form', async (req, res) => {
  try {
    const formData = req.body;
    
    // Validate required fields
    if (!formData.employeeName || !formData.employeeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee name and ID are required' 
      });
    }

    // Create transporter
    const transporter = createTransporter();

    // Verify SMTP connection
    await transporter.verify();

    // Email options
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.RECIPIENT_EMAIL || process.env.SMTP_USER,
      subject: `KPI Report - ${formData.employeeName} (${formData.employeeId})`,
      html: generateEmailTemplate(formData),
      text: generatePlainTextEmail(formData) // Fallback plain text version
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    
    res.json({ 
      success: true, 
      message: 'Form submitted and email sent successfully!',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    let errorMessage = 'Failed to send email. Please check your SMTP configuration.';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'SMTP authentication failed. Please check your email credentials.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Failed to connect to SMTP server. Please check your network connection.';
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Generate plain text version of email
const generatePlainTextEmail = (formData) => {
  return `
EMPLOYEE KPI DETAILS SUBMISSION
==============================

Personal and Period Details:
- Employee Name: ${formData.employeeName || 'Not provided'}
- Employee ID: ${formData.employeeId || 'Not provided'}
- Reporting Period: ${formData.periodStart || 'Not provided'} to ${formData.periodEnd || 'Not provided'}
- Time on Data Engineering: ${formData.dataEngTime || '0'}%
- Time on Frontend DevOps: ${formData.frontendDevOpsTime || '0'}%

Data Engineering-Related Items:
- Data Pipelines Worked On: ${formData.dataPipelines || 'Not provided'}
- Error and Incident Log: ${formData.errorIncidentLog || 'Not provided'}
- Data Quality Checks: ${formData.dataQualityChecks || 'Not provided'}
- Job Performance Metrics: ${formData.jobPerformanceMetrics || 'Not provided'}
- SLA Compliance: ${formData.slaCompliance || 'Not provided'}

Frontend Development-Related Items:
- Features or Tasks Completed: ${formData.featuresCompleted || 'Not provided'}
- Performance Metrics: ${formData.performanceMetrics || 'Not provided'}
- Bug and Error Log: ${formData.bugErrorLog || 'Not provided'}
- User Interaction Data: ${formData.userInteractionData || 'Not provided'}

DevOps-Related Items:
- Deployment Log: ${formData.deploymentLog || 'Not provided'}
- Change and Cycle Details: ${formData.changeCycleDetails || 'Not provided'}
- Incident Response Log: ${formData.incidentResponseLog || 'Not provided'}
- Infrastructure Metrics: ${formData.infrastructureMetrics || 'Not provided'}

Additional Items for Holistic Tracking:
- Time Allocation Log: ${formData.timeAllocationLog || 'Not provided'}
- Self-Assessment and Feedback: ${formData.selfAssessment || 'Not provided'}
- Supporting Evidence: ${formData.supportingEvidence || 'Not provided'}
  `;
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Make sure to configure your SMTP settings in the .env file');
});