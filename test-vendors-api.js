// Simple test to check if vendors API is working
const testAPI = async () => {
  try {
    console.log('Testing vendors API...');
    const response = await fetch('http://localhost:3000/api/vendors');
    const data = await response.json();
    console.log('API Response:', data);
    console.log('Vendors count:', data.vendors?.length || 0);
    
    if (data.vendors && data.vendors.length > 0) {
      console.log('Sample vendor:', data.vendors[0]);
    }
  } catch (error) {
    console.error('API Test failed:', error);
  }
};

// Run the test
testAPI();