// DOM Elements
const form = document.getElementById('kpiForm');
const saveBtn = document.getElementById('saveBtn');
const modal = document.getElementById('successModal');

// Form validation rules
const validationRules = {
    employeeName: {
        required: true,
        minLength: 2,
        message: 'Employee name must be at least 2 characters long'
    },
    employeeId: {
        required: true,
        pattern: /^[A-Za-z0-9]+$/,
        message: 'Employee ID must contain only letters and numbers'
    },
    periodStart: {
        required: true,
        message: 'Please select a start date'
    },
    periodEnd: {
        required: true,
        message: 'Please select an end date'
    },
    dataEngTime: {
        required: false,
        min: 0,
        max: 100,
        message: 'Percentage must be between 0 and 100'
    },
    frontendDevOpsTime: {
        required: false,
        min: 0,
        max: 100,
        message: 'Percentage must be between 0 and 100'
    }
};

// Initialize form
document.addEventListener('DOMContentLoaded', function() {
    loadDraftData();
    setupEventListeners();
    setupPercentageValidation();
    setupDateValidation();
});

// Event Listeners
function setupEventListeners() {
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Save draft
    saveBtn.addEventListener('click', saveDraft);
    
    // Auto-save every 30 seconds
    setInterval(autoSave, 30000);
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearErrors);
    });
}

// Form submission handler
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showNotification('Please fix the errors before submitting', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        // Collect form data
        const formData = new FormData(form);
        const formObject = {};
        
        // Convert FormData to regular object
        for (const [key, value] of formData.entries()) {
            formObject[key] = value;
        }
        
        // Send to backend
        const response = await fetch('/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObject)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Clear draft data
            localStorage.removeItem('kpiFormDraft');
            
            // Show success modal
            showSuccessModal();
            
            // Reset form
            form.reset();
            
            showNotification('Form submitted and email sent successfully!', 'success');
        } else {
            throw new Error(result.message || 'Submission failed');
        }
        
    } catch (error) {
        console.error('Submission error:', error);
        showNotification(error.message || 'Submission failed. Please try again.', 'error');
    } finally {
        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Form validation
function validateForm() {
    let isValid = true;
    const formData = new FormData(form);
    
    // Clear previous errors
    clearAllErrors();
    
    // Validate required fields and rules
    for (const [fieldName, rules] of Object.entries(validationRules)) {
        const field = form.querySelector(`[name="${fieldName}"]`);
        const value = formData.get(fieldName);
        
        if (!validateField({ target: field })) {
            isValid = false;
        }
    }
    
    // Validate date range
    const startDate = new Date(formData.get('periodStart'));
    const endDate = new Date(formData.get('periodEnd'));
    
    if (startDate && endDate && startDate >= endDate) {
        showFieldError('periodEnd', 'End date must be after start date');
        isValid = false;
    }
    
    // Validate percentage totals
    const dataEngTime = parseInt(formData.get('dataEngTime')) || 0;
    const frontendDevOpsTime = parseInt(formData.get('frontendDevOpsTime')) || 0;
    
    if (dataEngTime + frontendDevOpsTime > 100) {
        showFieldError('frontendDevOpsTime', 'Total percentage cannot exceed 100%');
        isValid = false;
    }
    
    return isValid;
}

// Individual field validation
function validateField(e) {
    const field = e.target;
    const fieldName = field.name;
    const value = field.value.trim();
    const rules = validationRules[fieldName];
    
    if (!rules) return true;
    
    // Clear previous error
    clearFieldError(field);
    
    // Required field validation
    if (rules.required && !value) {
        showFieldError(fieldName, `${getFieldLabel(fieldName)} is required`);
        return false;
    }
    
    if (value) {
        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
            showFieldError(fieldName, rules.message);
            return false;
        }
        
        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
            showFieldError(fieldName, rules.message);
            return false;
        }
        
        // Number range validation
        if (rules.min !== undefined || rules.max !== undefined) {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                showFieldError(fieldName, 'Please enter a valid number');
                return false;
            }
            if (rules.min !== undefined && numValue < rules.min) {
                showFieldError(fieldName, rules.message);
                return false;
            }
            if (rules.max !== undefined && numValue > rules.max) {
                showFieldError(fieldName, rules.message);
                return false;
            }
        }
    }
    
    return true;
}

// Error handling functions
function showFieldError(fieldName, message) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    const formGroup = field.closest('.form-group');
    
    // Remove existing error
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error styling
    field.classList.add('error');
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
}

function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    field.classList.remove('error');
    const errorMessage = formGroup.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function clearAllErrors() {
    const errorMessages = form.querySelectorAll('.error-message');
    const errorFields = form.querySelectorAll('.error');
    
    errorMessages.forEach(msg => msg.remove());
    errorFields.forEach(field => field.classList.remove('error'));
}

function clearErrors(e) {
    clearFieldError(e.target);
}

// Utility functions
function getFieldLabel(fieldName) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    const label = form.querySelector(`label[for="${field.id}"]`);
    return label ? label.textContent.replace(':', '') : fieldName;
}

// Draft saving functionality
function saveDraft() {
    const formData = new FormData(form);
    const draftData = {};
    
    for (const [key, value] of formData.entries()) {
        draftData[key] = value;
    }
    
    localStorage.setItem('kpiFormDraft', JSON.stringify(draftData));
    
    // Show success animation
    saveBtn.classList.add('success');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
    
    setTimeout(() => {
        saveBtn.classList.remove('success');
        saveBtn.innerHTML = originalText;
    }, 2000);
    
    showNotification('Draft saved successfully!', 'success');
}

function loadDraftData() {
    const draftData = localStorage.getItem('kpiFormDraft');
    
    if (draftData) {
        try {
            const data = JSON.parse(draftData);
            
            for (const [key, value] of Object.entries(data)) {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = value;
                }
            }
            
            showNotification('Draft data loaded', 'info');
        } catch (error) {
            console.error('Error loading draft data:', error);
        }
    }
}

function autoSave() {
    const formData = new FormData(form);
    let hasData = false;
    
    for (const [key, value] of formData.entries()) {
        if (value.trim()) {
            hasData = true;
            break;
        }
    }
    
    if (hasData) {
        const draftData = {};
        for (const [key, value] of formData.entries()) {
            draftData[key] = value;
        }
        localStorage.setItem('kpiFormDraft', JSON.stringify(draftData));
    }
}

// Percentage validation setup
function setupPercentageValidation() {
    const dataEngInput = document.getElementById('dataEngTime');
    const frontendDevOpsInput = document.getElementById('frontendDevOpsTime');
    
    function updatePercentageValidation() {
        const dataEngValue = parseInt(dataEngInput.value) || 0;
        const frontendDevOpsValue = parseInt(frontendDevOpsInput.value) || 0;
        const total = dataEngValue + frontendDevOpsValue;
        
        // Update max values
        dataEngInput.max = 100 - frontendDevOpsValue;
        frontendDevOpsInput.max = 100 - dataEngValue;
        
        // Visual feedback
        if (total > 100) {
            dataEngInput.classList.add('warning');
            frontendDevOpsInput.classList.add('warning');
        } else {
            dataEngInput.classList.remove('warning');
            frontendDevOpsInput.classList.remove('warning');
        }
    }
    
    dataEngInput.addEventListener('input', updatePercentageValidation);
    frontendDevOpsInput.addEventListener('input', updatePercentageValidation);
}

// Date validation setup
function setupDateValidation() {
    const startDateInput = document.getElementById('periodStart');
    const endDateInput = document.getElementById('periodEnd');
    
    startDateInput.addEventListener('change', function() {
        endDateInput.min = this.value;
        if (endDateInput.value && endDateInput.value <= this.value) {
            endDateInput.value = '';
        }
    });
}

// Modal functions
function showSuccessModal() {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}



// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to save draft
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDraft();
    }
    
    // Escape to close modal
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});

// Add CSS for notifications and error states
const additionalStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1001;
    transform: translateX(100%);
    animation: slideIn 0.3s ease forwards;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.notification-success { background: #10b981; }
.notification-error { background: #ef4444; }
.notification-warning { background: #f59e0b; }
.notification-info { background: #3b82f6; }

.notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.notification.fade-out {
    animation: slideOut 0.3s ease forwards;
}

@keyframes slideIn {
    to { transform: translateX(0); }
}

@keyframes slideOut {
    to { transform: translateX(100%); }
}

.form-group input.error,
.form-group textarea.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-group input.warning,
.form-group textarea.warning {
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 5px;
}

.error-message::before {
    content: '⚠';
    font-size: 0.75rem;
}

.btn-primary.loading {
    opacity: 0.7;
    cursor: not-allowed;
    position: relative;
}

.btn-primary.loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 16px;
    height: 16px;
    margin: -8px 0 0 -8px;
    border: 2px solid transparent;
    border-top: 2px solid #ffffff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);