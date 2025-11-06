// Simple test script to check vendor data and documents
const fetch = require('node-fetch');

async function testVendorDocuments() {
  try {
    // Assuming admin API is running on localhost:3002
    const response = await fetch('http://localhost:3002/api/admin/vendor');
    const vendors = await response.json();
    
    console.log('Number of vendors:', vendors.length);
    
    // Check the first few vendors for document data
    for (let i = 0; i < Math.min(3, vendors.length); i++) {
      const vendor = vendors[i];
      console.log(`\nVendor ${i + 1}:`, vendor.businessName);
      console.log('Status:', vendor.status);
      console.log('Documents object:', vendor.documents);
      
      if (vendor.documents) {
        const docTypes = ['aadharCard', 'udyogAadhar', 'udhayamCert', 'shopLicense', 'panCard'];
        docTypes.forEach(docType => {
          const hasDocument = !!vendor.documents[docType];
          const status = vendor.documents[`${docType}Status`] || 'pending';
          console.log(`  ${docType}: ${hasDocument ? 'UPLOADED' : 'NOT UPLOADED'} (Status: ${status})`);
        });
      }
    }
  } catch (error) {
    console.error('Error fetching vendor data:', error);
  }
}

testVendorDocuments();