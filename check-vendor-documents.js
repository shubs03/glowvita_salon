// Simple test to check vendor document data
const fs = require('fs');

// Read the vendor data file if it exists
const vendorDataPath = './vendor-data.json';

if (fs.existsSync(vendorDataPath)) {
  const vendorData = JSON.parse(fs.readFileSync(vendorDataPath, 'utf8'));
  console.log('Vendor Data:');
  console.log(JSON.stringify(vendorData, null, 2));
  
  // Check documents
  if (vendorData.documents) {
    console.log('\nDocument Status Check:');
    const docTypes = ['aadharCard', 'udyogAadhar', 'udhayamCert', 'shopLicense', 'panCard'];
    docTypes.forEach(docType => {
      const docValue = vendorData.documents[docType];
      const docStatus = vendorData.documents[`${docType}Status`] || 'not set';
      console.log(`${docType}: ${docValue ? 'UPLOADED' : 'NOT UPLOADED'} (Status: ${docStatus})`);
    });
  }
} else {
  console.log('No vendor data file found. Please run the admin panel and check vendor data.');
}