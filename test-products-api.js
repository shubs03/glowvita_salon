// Simple test to check if products API is working
const testProductsAPI = async () => {
  try {
    console.log('Testing products API...');
    const response = await fetch('http://localhost:3000/api/products');
    const data = await response.json();
    
    console.log('API Response Status:', response.status);
    console.log('API Response:', data);
    
    if (data.success) {
      console.log('✅ API Success!');
      console.log('Products count:', data.products?.length || 0);
      
      if (data.products && data.products.length > 0) {
        console.log('Sample product:', data.products[0]);
      } else {
        console.log('ℹ️ No products found - check if you have approved products in database');
      }
    } else {
      console.log('❌ API Failed:', data.message);
      console.log('Error details:', data.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testProductsAPI();