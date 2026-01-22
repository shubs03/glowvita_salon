/**
 * Region Filtering Verification Guide
 * 
 * This document explains how region filtering works and how to verify it's working correctly.
 */

// ============================================
// HOW REGION FILTERING WORKS
// ============================================

/**
 * 1. DATA STORAGE
 * - All regional data (Vendors, Orders, Appointments) have a `regionId` field
 * - Regions are stored in the `Region` collection with unique IDs
 * - Admin users have `assignedRegions` array (empty for Super Admin = all access)
 */

/**
 * 2. JWT TOKEN
 * When admin logs in, JWT contains:
 * {
 *   userId: "...",
 *   role: "admin",
 *   roleName: "SUPER_ADMIN" or "REGIONAL_ADMIN",
 *   permissions: ["vendors:view", "vendors:edit", ...],
 *   regions: [regionId1, regionId2, ...] // Empty array for Super Admin
 * }
 */

/**
 * 3. REGION QUERY HELPER
 * File: packages/lib/src/utils/regionQuery.js
 * 
 * getRegionQuery(user, selectedRegionId)
 * - Super Admin with selectedRegionId: { regionId: selectedRegionId }
 * - Super Admin without selection: {} (no filter, see all)
 * - Regional Admin: { regionId: { $in: assignedRegions } }
 */

/**
 * 4. API IMPLEMENTATION
 * Each API endpoint that returns regional data:
 * 
 * Example from dashboard/route.js:
 * ```javascript
 * const selectedRegionId = searchParams.get('regionId');
 * const regionFilter = getRegionQuery(req.user, selectedRegionId);
 * const combinedFilter = { ...dateFilter, ...regionFilter };
 * 
 * const totalBookings = await AppointmentModel.countDocuments(combinedFilter);
 * ```
 */

/**
 * 5. FRONTEND REGION SELECTOR
 * File: apps/admin/src/components/RegionSelector.tsx
 * 
 * - Only visible for Super Admins
 * - Fetches regions from /api/admin/regions
 * - Updates Redux state: selectedRegion
 * - Updates URL query param: ?regionId=xxx
 * - Dashboard and other pages read this param and pass to API
 */

// ============================================
// HOW TO VERIFY REGION FILTERING
// ============================================

/**
 * TEST 1: Super Admin - All Regions View
 * 
 * 1. Login as Super Admin
 * 2. Check Region Selector appears in header
 * 3. Select "All Regions" (empty value)
 * 4. Open browser DevTools > Network tab
 * 5. Navigate to Dashboard
 * 6. Check API call: GET /api/admin/dashboard
 * 7. Verify: NO regionId parameter in URL
 * 8. Verify: Response includes data from ALL regions
 */

/**
 * TEST 2: Super Admin - Specific Region Filter
 * 
 * 1. Login as Super Admin
 * 2. In Region Selector, choose "Pune"
 * 3. Open browser DevTools > Network tab
 * 4. Navigate to Dashboard
 * 5. Check API call: GET /api/admin/dashboard?regionId=<pune_id>
 * 6. Verify: regionId parameter is present
 * 7. Verify: Response includes ONLY Pune data
 * 8. Check vendor counts, bookings, revenue - all should be Pune-specific
 */

/**
 * TEST 3: Regional Admin - Auto-Scoped
 * 
 * 1. Create a Regional Admin assigned to "Mumbai"
 * 2. Login as that Regional Admin
 * 3. Verify: Region Selector does NOT appear (not Super Admin)
 * 4. Open browser DevTools > Network tab
 * 5. Navigate to Dashboard
 * 6. Check API call: GET /api/admin/dashboard
 * 7. Verify: Server automatically filters by Mumbai (check response data)
 * 8. Try accessing /vendors - should only see Mumbai vendors
 */

/**
 * TEST 4: Database Verification
 * 
 * Run this in MongoDB shell or Compass:
 * 
 * // Check regions exist
 * db.regions.find()
 * 
 * // Check vendors have regionId
 * db.vendors.find({}, { businessName: 1, regionId: 1 })
 * 
 * // Count vendors per region
 * db.vendors.aggregate([
 *   { $group: { _id: "$regionId", count: { $sum: 1 } } },
 *   { $lookup: { from: "regions", localField: "_id", foreignField: "_id", as: "region" } }
 * ])
 * 
 * // Check appointments have regionId
 * db.appointments.find({}, { vendorId: 1, regionId: 1 }).limit(10)
 */

/**
 * TEST 5: API Direct Testing
 * 
 * Use Postman or curl:
 * 
 * // Get all regions (Super Admin only)
 * GET /api/admin/regions
 * Headers: { Authorization: "Bearer <super_admin_token>" }
 * 
 * // Get dashboard with region filter
 * GET /api/admin/dashboard?regionId=<region_id>
 * Headers: { Authorization: "Bearer <token>" }
 * 
 * // Get vendors with region filter
 * GET /api/admin/vendor?regionId=<region_id>
 * Headers: { Authorization: "Bearer <token>" }
 */

// ============================================
// COMMON ISSUES & SOLUTIONS
// ============================================

/**
 * ISSUE: Region Selector not showing
 * SOLUTION: 
 * - Check user roleName is exactly "SUPER_ADMIN" (case-sensitive)
 * - Check JWT token includes roleName field
 * - Check browser console for errors
 */

/**
 * ISSUE: Region Selector shows but no regions load
 * SOLUTION:
 * - Check /api/admin/regions returns 200 (not 403)
 * - Verify Authorization header is sent with request
 * - Check regions exist in database: db.regions.find()
 */

/**
 * ISSUE: Dashboard shows all data even with region selected
 * SOLUTION:
 * - Check URL has ?regionId=xxx parameter
 * - Verify API receives regionId in searchParams
 * - Check regionFilter is applied to all queries
 * - Verify data in DB has regionId field populated
 */

/**
 * ISSUE: Regional Admin sees no data
 * SOLUTION:
 * - Check admin.assignedRegions is not empty
 * - Verify JWT token includes regions array
 * - Check data in DB has matching regionId values
 * - Ensure regionId is ObjectId type, not string
 */

// ============================================
// DEBUGGING TIPS
// ============================================

/**
 * 1. Check JWT Token Contents
 * - Login and copy admin_access_token from cookies
 * - Paste into https://jwt.io
 * - Verify payload has: roleName, permissions, regions
 */

/**
 * 2. Check Redux State
 * - Install Redux DevTools extension
 * - Check adminAuth.admin.roleName
 * - Check adminAuth.selectedRegion
 */

/**
 * 3. Check API Requests
 * - Open DevTools > Network
 * - Filter by "Fetch/XHR"
 * - Check request headers have Authorization
 * - Check request URL has regionId param (for Super Admin)
 */

/**
 * 4. Check Server Logs
 * - Look for "GET /api/admin/dashboard" logs
 * - Check req.user.roleName value
 * - Check req.user.assignedRegions value
 * - Check regionFilter value before query
 */

module.exports = {
  // Export for testing if needed
};
