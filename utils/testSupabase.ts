import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.local' }); // Explicitly load .env.local file

import { supabase } from "./supabaseClient"; // Use existing Supabase client

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("Environment variables are not loaded correctly.");
} else {
  console.log("Environment variables loaded successfully.");
}

async function testSupabase() {
  console.log("Testing Supabase connection...");

  const { data, error } = await supabase
    .from("budget")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Error testing Supabase connection:", error);
  } else {
    console.log("Supabase connection successful. Data:", data);
  }
}

testSupabase();
