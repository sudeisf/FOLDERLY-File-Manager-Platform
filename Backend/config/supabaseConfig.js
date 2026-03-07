const { createClient } = require("@supabase/supabase-js");
require("dotenv").config(); // Load environment variables from .env file

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Export the storage module
module.exports = supabase.storage;
