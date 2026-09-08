/**
 * Barangay E-Portal - Core Client Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Services
  loadDynamicNavigation();
  initFormValidations();
  initFileUploadPreviews();
});

/**
 * 1. Dynamic Navigation Loader
 * Fetch external nav.html files into element tags with [data-nav-target]
 */
async function loadDynamicNavigation() {
  const navContainer = document.querySelector('[data-nav-target]');
  if (!navContainer) return;

  const navPath = navContainer.getAttribute('data-nav-target');

  try {
    const response = await fetch(navPath);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    navContainer.innerHTML = html;
  } catch (error) {
    console.error('Failed to load navigation bar:', error);
  }
}

/**
 * 2. Registration & Login Form Validations
 */
function initFormValidations() {
  const passwordForms = document.querySelectorAll('form');

  passwordForms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      const pass = form.querySelector('input[type="password"]');
      const confirmPass = form.querySelectorAll('input[type="password"]')[1];

      // Verify passwords match if registration form
      if (pass && confirmPass && pass.value !== confirmPass.value) {
        e.preventDefault();
        alert('Passwords do not match. Please verify your password entry.');
        confirmPass.focus();
        return false;
      }
    });
  });
}

/**
 * 3. File Input Helper Preview
 * Provides immediate feedback when users upload IDs or Appointment Proof
 */
function initFileUploadPreviews() {
  const fileInputs = document.querySelectorAll('input[type="file"]');

  fileInputs.forEach((input) => {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // Limit file size to 5MB max
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          alert('File size exceeds 5MB limit. Please upload a smaller document.');
          input.value = ''; // Reset selection
          return;
        }

        console.log(`[File Selected]: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      }
    });
  });
}

/**
 * 4. Modal Handler Helper Functions
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

/**
 * 5. Mock Data Service (Local Storage Helper)
 * Call this function to submit requests dynamically from client side
 */
function submitDocumentRequest(docType, purpose) {
  const existingRequests = JSON.parse(localStorage.getItem('brgy_requests')) || [];
  
  const newRequest = {
    id: `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    type: docType,
    purpose: purpose,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    status: 'Pending Approval'
  };

  existingRequests.push(newRequest);
  localStorage.setItem('brgy_requests', JSON.stringify(existingRequests));
  return newRequest;
}