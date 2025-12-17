# Vendor Configuration Scripts

## Purpose

This directory contains scripts to update, verify, and troubleshoot vendor configurations for proper travel time calculations.

## Prerequisites

1. Make sure your MongoDB database is accessible
2. Ensure you have the correct MongoDB connection string in your environment variables
3. Install dependencies: `npm install`

## Environment Variables

The scripts look for the MongoDB connection URI in these environment variables (in order):
- `MONGODB_URI`
- `MONGO_URI`

Make sure one of these is set in your environment or `.env` file.

## Running the Scripts

1. Navigate to the project root directory:
   ```
   cd glowvita_salon
   ```

2. Run the update script:
   ```
   node scripts/updateVendorConfigurations.js
   ```
   
   Or use the NPM script:
   ```
   npm run update-vendor-config
   ```

3. Optionally, verify the configuration:
   ```
   node scripts/verifyVendorConfigurations.js
   ```
   
   Or use the NPM script:
   ```
   npm run verify-vendor-config
   ```

4. Fix a specific vendor (useful for troubleshooting):
   ```
   node scripts/fixSpecificVendor.js
   ```
   
   Or use the NPM script:
   ```
   npm run fix-specific-vendor
   ```

5. Test travel time calculation for a specific vendor:
   ```
   node scripts/testTravelTimeCalculation.js
   ```
   
   Or use the NPM script:
   ```
   npm run test-travel-time
   ```

6. Diagnose vendor travel configuration issues:
   ```
   node scripts/diagnoseVendorTravelConfig.js
   ```
   
   Or use the NPM script:
   ```
   npm run diagnose-vendor-travel
   ```

7. Check Google Maps API configuration:
   ```
   node scripts/checkGoogleMapsConfig.js
   ```
   
   Or use the NPM script:
   ```
   npm run check-google-maps
   ```

8. Update vendor travel radius:
   ```
   node scripts/updateVendorTravelRadius.js
   ```
   
   Or use the NPM script:
   ```
   npm run update-vendor-radius
   ```

9. Test location-based vendor filtering:
   ```
   node scripts/testLocationBasedVendorFiltering.js
   ```
   
   Or use the NPM script:
   ```
   npm run test-location-filtering
   ```

10. Test API endpoint:
   ```
   node scripts/simpleApiTest.js
   ```
   
   Or use the NPM script:
   ```
   npm run test-api
   ```

## What the Script Does

1. Connects to the MongoDB database
2. Fetches all vendor documents
3. For each vendor, checks if the required fields are properly configured:
   - If `vendorType` is missing or set to 'shop-only', it's updated to 'hybrid'
   - If `travelRadius` is missing or 0, it's set to 20 km
   - If `travelSpeed` is missing or 0, it's set to 30 km/h
   - If `baseLocation` is missing, it's set from the vendor's main location
4. Updates only the vendors that need changes
5. Provides a summary of how many vendors were processed and updated

## Customization

You can customize the default values in the update script:
- `vendorType`: Change from 'hybrid' to another supported type
- `travelRadius`: Adjust the default radius (currently 20 km)
- `travelSpeed`: Adjust the default speed (currently 30 km/h)

Supported vendor types:
- `shop-only`: Vendor only provides services at their shop
- `home-only`: Vendor operates from home and travels to customers
- `onsite-only`: Vendor has no shop and only provides onsite services
- `hybrid`: Vendor has a shop but also provides onsite services
- `vendor-home-travel`: Vendor operates from home and travels to customers

## Verification

After running the update script, you can verify that vendors are properly configured by running the verification script. This script will show you which vendors are properly configured and which ones still need attention.

## Troubleshooting

If you encounter connection issues:
1. Verify your MongoDB connection string is correct
2. Ensure your MongoDB instance is running and accessible
3. Check firewall settings if connecting to a remote database