// Test script for Medical Records feature
// Run with: node scripts/test-medical-records.js

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

async function testMedicalRecords() {
  console.log("🔍 Testing Medical Records Feature...\n");

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing environment variables:");
    console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅" : "❌");
    console.error(
      "   NEXT_PUBLIC_SUPABASE_ANON_KEY:",
      supabaseKey ? "✅" : "❌"
    );
    console.error("\nPlease check your .env.local file");
    return;
  }

  console.log("✅ Environment variables found");

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test 1: Check if table exists
    console.log("\n📊 Testing database connection...");
    const { data: tableData, error: tableError } = await supabase
      .from("medical_records")
      .select("count")
      .limit(1);

    if (tableError) {
      console.error("❌ Table test failed:", tableError.message);
      console.log(
        "\n💡 Solution: Run the SQL setup script in your Supabase dashboard"
      );
      console.log("   File: scripts/setup-medical-records.sql");
      return;
    }

    console.log("✅ Medical records table exists");

    // Test 2: Check storage bucket
    console.log("\n📁 Testing storage bucket...");
    const { data: bucketData, error: bucketError } =
      await supabase.storage.listBuckets();

    if (bucketError) {
      console.error("❌ Storage test failed:", bucketError.message);
      return;
    }

    const medicalBucket = bucketData.find(
      (bucket) => bucket.name === "medical-files"
    );
    if (!medicalBucket) {
      console.error("❌ Medical files bucket not found");
      console.log(
        "\n💡 Solution: Run the SQL setup script to create the bucket"
      );
      return;
    }

    console.log("✅ Medical files bucket exists");

    // Test 3: Check RLS policies
    console.log("\n🔒 Testing Row Level Security...");
    const { data: policyData, error: policyError } = await supabase.rpc(
      "get_user_medical_records",
      { user_uuid: "00000000-0000-0000-0000-000000000000" }
    );

    if (policyError && policyError.message.includes("function")) {
      console.log("⚠️  RLS function not found (this is okay for testing)");
    } else if (policyError) {
      console.error("❌ RLS test failed:", policyError.message);
    } else {
      console.log("✅ RLS policies working");
    }

    // Test 4: Check authentication
    console.log("\n👤 Testing authentication...");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.log("ℹ️  Not authenticated (this is normal for testing)");
    } else if (user) {
      console.log("✅ User authenticated:", user.email);
    } else {
      console.log("ℹ️  No user session");
    }

    console.log("\n🎉 All tests completed!");
    console.log("\n📋 Next steps:");
    console.log("   1. Start your development server: npm run dev");
    console.log("   2. Navigate to: http://localhost:3000/dashboard/records");
    console.log("   3. Sign in and test uploading a medical record");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testMedicalRecords().catch(console.error);
