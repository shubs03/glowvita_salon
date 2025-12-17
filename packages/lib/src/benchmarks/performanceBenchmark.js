/**
 * Performance Benchmark Script
 * 
 * This script runs performance tests on critical functions of the booking system.
 */

import { calculateHaversineTime, calculateHaversineDistance } from '../modules/scheduling/EnhancedTravelUtils.js';
import PricingEngine from '../modules/pricing/PricingEngine.js';
import { timeToMinutes, minutesToTime } from '../modules/scheduling/FreshaLikeSlotEngine.js';

/**
 * Benchmark function execution time
 * @param {Function} fn - Function to benchmark
 * @param {string} name - Name of the test
 * @param {number} iterations - Number of iterations to run
 * @returns {Promise<number>} - Average execution time in milliseconds
 */
async function benchmark(fn, name, iterations = 1000) {
  console.log(`Running benchmark: ${name} (${iterations} iterations)`);
  
  const start = process.hrtime.bigint();
  
  for (let i = 0; i < iterations; i++) {
    await fn();
  }
  
  const end = process.hrtime.bigint();
  const totalTime = Number(end - start) / 1000000; // Convert to milliseconds
  const averageTime = totalTime / iterations;
  
  console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`  Average time: ${averageTime.toFixed(4)}ms`);
  console.log('');
  
  return averageTime;
}

/**
 * Run all benchmarks
 */
async function runBenchmarks() {
  console.log('=== PERFORMANCE BENCHMARKS ===\n');
  
  // Benchmark Haversine distance calculation
  await benchmark(
    () => calculateHaversineDistance(
      { lat: 12.9716, lng: 77.5946 },
      { lat: 13.0000, lng: 77.6000 }
    ),
    'Haversine Distance Calculation'
  );
  
  // Benchmark Haversine time calculation
  await benchmark(
    () => calculateHaversineTime(
      { lat: 12.9716, lng: 77.5946 },
      { lat: 13.0000, lng: 77.6000 },
      30
    ),
    'Haversine Time Calculation'
  );
  
  // Benchmark pricing calculation
  await benchmark(
    () => PricingEngine.calculatePrice(
      {
        price: 1000,
        discountedPrice: 900,
        tax: {
          enabled: true,
          type: 'percentage',
          value: 18
        }
      },
      {
        vendorType: 'hybrid',
        location: { lat: 12.9716, lng: 77.5946 },
        baseLocation: { lat: 12.9716, lng: 77.5946 },
        travelRadius: 20,
        travelSpeed: 30
      },
      { lat: 12.9717, lng: 77.5947 },
      false,
      new Date()
    ),
    'Price Calculation'
  );
  
  // Benchmark time conversion
  await benchmark(
    () => timeToMinutes('10:30AM'),
    'Time to Minutes Conversion'
  );
  
  await benchmark(
    () => minutesToTime(630),
    'Minutes to Time Conversion'
  );
  
  console.log('=== BENCHMARKS COMPLETED ===');
}

// Run benchmarks if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBenchmarks().catch(console.error);
}

export default runBenchmarks;