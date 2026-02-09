import { calculateBookingAmount } from './temp_paymentCalculator_v2.js';
import fs from 'fs';

async function test() {
    let logBuffer = '';
    const log = (msg) => {
        console.log(msg);
        logBuffer += (typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg) + '\n';
    };

    log('--- Starting Test for Rounding Adjustments ---');

    const services = [{
        price: 449,
        discountedPrice: null,
        selectedAddons: []
    }];

    const taxFeeSettings = {
        platformFee: 15.5, // 15.5% platform fee
        platformFeeType: 'percentage',
        platformFeeEnabled: true,
        serviceTax: 18,
        serviceTaxType: 'percentage',
        serviceTaxEnabled: true
    };

    log('Input:');
    log('  Service Amount: 449');
    log('  Platform Fee Rate: 15.5%');
    log('  Tax Rate: 18%');

    const result = await calculateBookingAmount(services, null, taxFeeSettings);
    log('Output Result:');
    log(result);

    // Manual check of expected values:
    // Subtotal: 449
    // Platform Fee: 449 * 0.155 = 69.595 -> rounded to 2 places: 69.6
    // GST (18% of 449): 449 * 0.18 = 80.82 -> 80.82
    // Total (no discount): 449 + 69.595 + 80.82 = 599.415 -> rounded to integer: 599

    const expectedPlatformFee = 69.6;
    const expectedServiceTax = 80.82;
    const expectedFinalTotal = 599;

    log('\nVerification:');
    log(`  Platform Fee: ${result.platformFee} (Expected: ${expectedPlatformFee})`);
    log(`  Service Tax: ${result.serviceTax} (Expected: ${expectedServiceTax})`);
    log(`  Final Total: ${result.finalTotal} (Expected: ${expectedFinalTotal})`);

    const passed =
        Math.abs(result.platformFee - expectedPlatformFee) < 0.01 &&
        Math.abs(result.serviceTax - expectedServiceTax) < 0.01 &&
        result.finalTotal === expectedFinalTotal;

    log(`\nTest Result: ${passed ? 'PASSED' : 'FAILED'}`);

    fs.writeFileSync('packages/lib/src/utils/test_rounding_result.txt', logBuffer);
}

test().catch(console.error);
