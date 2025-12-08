// backend/seed-data/singleproducts/add-percentage-prices.js
import mongoose from "mongoose";
import SingleProduct from "../../models/SingleProduct.js";

const MONGODB_URI = "mongodb://localhost:27017/j2b"; // Update with your DB name

const addPercentagePricesToAllDocuments = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const result = await SingleProduct.updateMany(
      {},
      {
        $set: {
          "combinations.$[].suppliers.$[].price.percentagePrice1": 0,
          "combinations.$[].suppliers.$[].price.percentagePrice2": 0,
          "combinations.$[].suppliers.$[].price.percentagePrice3": 0
        }
      }
    );

    console.log(`✅ Migration completed!`);
    console.log(`   - Matched: ${result.matchedCount} documents`);
    console.log(`   - Modified: ${result.modifiedCount} documents`);

    const sampleDoc = await SingleProduct.findOne().lean();
    if (sampleDoc && sampleDoc.combinations && sampleDoc.combinations[0]) {
      console.log("\n📄 Sample document after migration:");
      console.log(JSON.stringify(sampleDoc.combinations[0].suppliers[0].price, null, 2));
    }

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
};

addPercentagePricesToAllDocuments();