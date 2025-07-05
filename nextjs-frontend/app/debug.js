// Debug script to identify 400/500 errors
// Run this in your browser console on the deployed site

console.log('🔍 Starting CareerPilot Debug...');

// Test 1: Check if the app loads without errors
console.log('✅ App loaded successfully');

// Test 2: Check for any JavaScript errors
window.addEventListener('error', (event) => {
  console.error('❌ JavaScript Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

// Test 3: Check for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled Promise Rejection:', {
    reason: event.reason,
    promise: event.promise
  });
});

// Test 4: Check API endpoints
async function testAPIEndpoints() {
  const endpoints = [
    '/api/health',
    '/api/debug',
    '/api/todo',
    '/api/assessments'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      console.log(`🌐 ${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

// Test 5: Check if Clerk is working
function checkClerk() {
  if (window.Clerk) {
    console.log('✅ Clerk is loaded');
    console.log('Clerk user:', window.Clerk.user);
  } else {
    console.log('❌ Clerk is not loaded');
  }
}

// Test 6: Check for any console errors in the page
function checkConsoleErrors() {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = function(...args) {
    console.log('🚨 Console Error:', args);
    originalError.apply(console, args);
  };
  
  console.warn = function(...args) {
    console.log('⚠️ Console Warning:', args);
    originalWarn.apply(console, args);
  };
}

// Run all tests
setTimeout(() => {
  console.log('🔍 Running debug tests...');
  testAPIEndpoints();
  checkClerk();
  checkConsoleErrors();
}, 2000);

console.log('🔍 Debug script loaded. Check console for results.'); 