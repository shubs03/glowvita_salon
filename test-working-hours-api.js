/**
 * Test script to verify the working hours API integration
 * Run this with: node test-working-hours-api.js
 */

const testWorkingHoursAPI = async () => {
  try {
    // Test with a sample vendor ID (you'll need to replace with a real one)
    const sampleVendorId = "507f1f77bcf86cd799439011"; // Replace with actual vendor ID
    const apiUrl = `http://localhost:3000/api/working-hours?vendorId=${sampleVendorId}`;
    
    console.log('Testing Working Hours API...');
    console.log('URL:', apiUrl);
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    console.log('\n=== API Response ===');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.data && data.data.workingHours) {
      console.log('\n=== Transformed for Step3_TimeSlot ===');
      const transformedHours = data.data.workingHours.map(dayHours => {
        const isClosed = dayHours.hours === 'Closed' || !dayHours.hours;
        
        if (isClosed) {
          return {
            dayOfWeek: dayHours.day,
            startTime: '',
            endTime: '',
            isAvailable: false
          };
        }
        
        // Parse the hours format like "9:00 AM - 6:00 PM"
        const hoursMatch = dayHours.hours.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
        
        if (!hoursMatch) {
          console.warn('Could not parse hours format:', dayHours.hours);
          return {
            dayOfWeek: dayHours.day,
            startTime: '',
            endTime: '',
            isAvailable: false
          };
        }
        
        // Convert 12-hour format to 24-hour format
        const startTime = convert12to24Hour(hoursMatch[1].trim());
        const endTime = convert12to24Hour(hoursMatch[2].trim());
        
        return {
          dayOfWeek: dayHours.day,
          startTime,
          endTime,
          isAvailable: true
        };
      });
      
      console.log(JSON.stringify(transformedHours, null, 2));
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
};

/**
 * Helper function to convert 12-hour time format to 24-hour format
 */
const convert12to24Hour = (time12) => {
  if (!time12) return '';
  
  const timePattern = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
  const match = time12.match(timePattern);
  
  if (!match) return time12; // Return as-is if it doesn't match expected format
  
  let [, hours, minutes, ampm] = match;
  let hour24 = parseInt(hours);
  
  if (ampm.toUpperCase() === 'AM') {
    if (hour24 === 12) hour24 = 0;
  } else {
    if (hour24 !== 12) hour24 += 12;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes}`;
};

// Run the test
testWorkingHoursAPI();