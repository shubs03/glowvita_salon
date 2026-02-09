import { calculateBookingAmount } from './temp_paymentCalculator.js';
import fs from 'fs';
import path from 'path';

async function test() {
    let logBuffer = '';
    const log = (msg) => {
        console.log(msg);
        logBuffer += msg + '\n';
    };

    log('--- Starting Test for Service Tax Calculation ---');

    const services = [{
        price: 449,
        discountedPrice: null,
        selectedAddons: []
    }];

    const taxFeeSettings = {
        platformFee: 67,
        platformFeeType: 'fixed',
        platformFeeEnabled: true,
        serviceTax: 18,
        serviceTaxType: 'percentage',
        serviceTaxEnabled: true
    };

    log('Input:');
    log('  Service Amount: 449');
    log('  Platform Fee: 67');
    log('  Tax Rate: 18%');

    const result = await calculateBookingAmount(services, null, taxFeeSettings);

    log('\nOutput Result: ' + JSON.stringify(result, null, 2));

    // Verification
    // 449 * 0.18 = 80.82. Math.round(80.82) = 81.
    const expectedServiceTax = 81;
    // Previous incorrect calculation: (449 + 67) * 0.18 = 92.88 -> 93.

    if (result.serviceTax === expectedServiceTax) {
        log(`\n✅ PASS: Service Tax is ${result.serviceTax} (matches expected ${expectedServiceTax})`);
        log('   The tax was calculated on Subtotal (449) correctly.');
    } else {
        log(`\n❌ FAIL: Service Tax is ${result.serviceTax}, expected ${expectedServiceTax}`);
        if (result.serviceTax === 93) {
            log('   It seems the tax is still being calculated on (Subtotal + Platform Fee).');
        }
    }

    try {
        fs.writeFileSync('packages/lib/src/utils/test_result.txt', logBuffer);
        console.log('Result written to test_result.txt');
    } catch (err) {
        console.error('Error writing result file:', err);
    }
}

test();
