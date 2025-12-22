# Utility Scripts

## Purpose

This directory contains scripts for managing vendor configurations, wedding packages, and database operations for the Glowvita Salon application.

## Prerequisites

1. Make sure your MongoDB database is accessible
2. Ensure you have the correct MongoDB connection string in your environment variables
3. Install dependencies: `npm install` or `turbo install`

## Environment Variables

The scripts look for the MongoDB connection URI in these environment variables (in order):
- `MONGODB_URI`
- `MONGO_URI`

Set these in `apps/web/.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/glowvita
```

## Available Scripts

### Wedding Packages Management

#### 1. Check Wedding Packages
```bash
node scripts/check-wedding-packages.js
```
**Purpose**: Displays all wedding packages for a vendor and shows which ones are visible to customers.

**What it shows**:
- Total packages count
- Package details (name, price, services, status)
- Active & approved packages (visible to customers)
- API endpoint information

**Example Output**:
```
✅ Active & Approved Packages (visible to customers): 1

1. Bride Package
   Price: ₹300
   Duration: 105 min
   Services: 2

✅ Customers can see and book these packages!
```

#### 2. Approve Wedding Package
```bash
node scripts/approve-wedding-package.js
```
**Purpose**: Approves a pending wedding package so it becomes visible to customers.

**Steps**:
1. Run `check-wedding-packages.js` to get the package ID
2. Update `packageId` variable in the script
3. Run the script

#### 3. Create Sample Wedding Package
```bash
node scripts/create-sample-wedding-package.js
```
**Purpose**: Creates a sample wedding package for testing.

**Features**:
- Automatically selects services from the vendor
- Calculates total price and duration
- Applies 10% discount
- Sets status to "approved" for immediate visibility

### Vendor Travel Settings

#### 4. Update Vendor Travel Settings
```bash
node scripts/update-vendor-travel-settings.js
```
**Purpose**: Updates vendor travel settings for home service bookings.

**Settings Updated**:
- Travel radius (km)
- Travel speed (km/h)
- Vendor type (shop-only, home-only, hybrid, etc.)
- Base location (latitude, longitude)

**Note**: These settings can now be managed via **CRM → Salon Profile → Travel Settings** tab.

## Common Workflows

### Setting Up Wedding Packages

1. **Check if packages exist**:
   ```bash
   node scripts/check-wedding-packages.js
   ```

2. **If no packages, create a sample one**:
   ```bash
   node scripts/create-sample-wedding-package.js
   ```

3. **If packages are pending, approve them**:
   ```bash
   node scripts/approve-wedding-package.js
   ```

4. **Verify the package is visible**:
   ```bash
   node scripts/check-wedding-packages.js
   ```

### Enabling Home Services

1. **Update travel settings**:
   ```bash
   node scripts/update-vendor-travel-settings.js
   ```
   
   Or use the CRM interface:
   - Go to CRM → Salon Profile
   - Click "Travel Settings" tab
   - Set travel radius, speed, and vendor type
   - Save changes

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