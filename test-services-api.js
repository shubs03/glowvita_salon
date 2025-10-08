// Quick test script to check the services API
const testVendorId = "YOUR_VENDOR_ID_HERE"; // Replace with actual vendor ID

async function testServicesAPI() {
  try {
    const response = await fetch(`http://localhost:3000/api/services/vendor/${testVendorId}`);
    const data = await response.json();
    
    console.log("API Response Status:", response.status);
    console.log("API Response Data:", JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log(`✅ Success! Found ${data.count} services`);
      if (data.services.length > 0) {
        console.log("Sample service:", data.services[0]);
      }
    } else {
      console.log("❌ API returned success: false");
      console.log("Error message:", data.message);
    }
  } catch (error) {
    console.error("❌ Error testing API:", error.message);
  }
}

// Run the test
testServicesAPI();