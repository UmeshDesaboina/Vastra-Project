const mongoose = require('mongoose');
require('dotenv').config();

// Connection strings
const TEST_DB = 'mongodb+srv://vastrastoredb:Umesh7886%40@vastrastore.bfucuue.mongodb.net/test?appName=vastrastore';
const PROD_DB = process.env.MONGODB_URI;

async function migrate() {
  try {
    console.log('Connecting to test database...');
    const testConn = await mongoose.createConnection(TEST_DB).asPromise();
    console.log('Connected to test database');

    console.log('Connecting to vastrastore database...');
    const prodConn = await mongoose.createConnection(PROD_DB).asPromise();
    console.log('Connected to vastrastore database');

    // Define schemas (simplified - just need to copy data)
    const collections = ['products', 'categories', 'users', 'orders', 'banners'];

    for (const collectionName of collections) {
      console.log(`\nMigrating ${collectionName}...`);
      
      // Check if collection exists in test db
      const testCollections = await testConn.db.listCollections({ name: collectionName }).toArray();
      if (testCollections.length === 0) {
        console.log(`  ${collectionName} does not exist in test db, skipping`);
        continue;
      }

      const testCollection = testConn.collection(collectionName);
      const prodCollection = prodConn.collection(collectionName);

      // Get all documents from test db
      const docs = await testCollection.find({}).toArray();
      console.log(`  Found ${docs.length} documents in test db`);

      if (docs.length > 0) {
        // Check if any documents already exist in prod db
        const existingCount = await prodCollection.countDocuments();
        
        if (existingCount > 0) {
          console.log(`  ${existingCount} documents already exist in vastrastore db`);
          console.log(`  Clearing existing documents...`);
          await prodCollection.deleteMany({});
        }

        // Insert all documents into prod db
        await prodCollection.insertMany(docs);
        console.log(`  Migrated ${docs.length} documents to vastrastore db`);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    await testConn.close();
    await prodConn.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
