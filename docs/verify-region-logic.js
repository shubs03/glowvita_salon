/**
 * Verification script for Multi-Region Admin Support
 * Run this script to verify the core logic of region filtering and locking.
 */

// Mock User and Utility
const getRegionQuery = (user, selectedRegionId = null) => {
  const { roleName, assignedRegions } = user;
  if (roleName === "SUPER_ADMIN" || roleName === "superadmin") {
    if (selectedRegionId) return { regionId: selectedRegionId };
    return {};
  }
  if (assignedRegions && assignedRegions.length > 0) {
    if (selectedRegionId && assignedRegions.includes(selectedRegionId)) return { regionId: selectedRegionId };
    return { regionId: { $in: assignedRegions } };
  }
  return { regionId: "none" };
};

const validateAndLockRegion = (user, inputRegionId) => {
  const { roleName, assignedRegions } = user;
  if (roleName === "SUPER_ADMIN" || roleName === "superadmin") return inputRegionId;
  if (assignedRegions && assignedRegions.length > 0) {
    if (inputRegionId && assignedRegions.includes(inputRegionId)) return inputRegionId;
    return assignedRegions[0];
  }
  return null;
};

// Test Cases
const tests = [
  {
    name: "Super Admin - No selection",
    user: { roleName: "SUPER_ADMIN", assignedRegions: [] },
    selected: null,
    expectedQuery: {},
    expectedLock: "any-region"
  },
  {
    name: "Super Admin - Selection",
    user: { roleName: "SUPER_ADMIN", assignedRegions: [] },
    selected: "region-1",
    expectedQuery: { regionId: "region-1" },
    expectedLock: "region-1"
  },
  {
    name: "Regional Admin - Multiple regions",
    user: { roleName: "REGIONAL_ADMIN", assignedRegions: ["region-1", "region-2"] },
    selected: null,
    expectedQuery: { regionId: { $in: ["region-1", "region-2"] } },
    expectedLock: "region-1" // Lock to first if invalid
  },
  {
    name: "Regional Admin - Valid selection",
    user: { roleName: "REGIONAL_ADMIN", assignedRegions: ["region-1", "region-2"] },
    selected: "region-2",
    expectedQuery: { regionId: "region-2" },
    expectedLock: "region-2"
  },
  {
    name: "Regional Admin - Invalid selection",
    user: { roleName: "REGIONAL_ADMIN", assignedRegions: ["region-1", "region-2"] },
    selected: "region-3",
    expectedQuery: { regionId: { $in: ["region-1", "region-2"] } },
    expectedLock: "region-1"
  }
];

console.log("Starting Verification Tests...\n");

tests.forEach(test => {
  const query = getRegionQuery(test.user, test.selected);
  const lock = validateAndLockRegion(test.user, test.selected || "any-region");
  
  console.log(`Test: ${test.name}`);
  console.log(`- Query: ${JSON.stringify(query)}`);
  console.log(`- Lock: ${lock}`);
  
  const queryPassed = JSON.stringify(query) === JSON.stringify(test.expectedQuery);
  const lockPassed = lock === (test.expectedLock === "any-region" ? (test.selected || "any-region") : test.expectedLock);
  
  if (queryPassed && lockPassed) {
    console.log("Result: PASSED\n");
  } else {
    console.log("Result: FAILED");
    if (!queryPassed) console.log(`  Expected Query: ${JSON.stringify(test.expectedQuery)}`);
    if (!lockPassed) console.log(`  Expected Lock: ${test.expectedLock}\n`);
  }
});

console.log("Verification finished.");
