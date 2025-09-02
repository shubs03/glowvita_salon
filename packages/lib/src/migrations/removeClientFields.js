import ClientModel from '../models/Vendor/Client.model.js';
import _db from '../db.js';

// Connect to database
await _db();

console.log('Starting migration to remove unused fields from Client documents...');

try {
  // Remove the fields from all client documents
  const result = await ClientModel.updateMany(
    {}, // Match all documents
    {
      $unset: {
        notes: "",
        socialMediaLinks: "",
        emergencyContact: "",
        tags: "",
        searchText: ""
      }
    }
  );

  console.log(`Migration completed successfully!`);
  console.log(`Matched ${result.matchedCount} documents`);
  console.log(`Modified ${result.modifiedCount} documents`);
  console.log(`Acknowledged: ${result.acknowledged}`);
} catch (error) {
  console.error('Migration failed:', error);
} finally {
  process.exit(0);
}