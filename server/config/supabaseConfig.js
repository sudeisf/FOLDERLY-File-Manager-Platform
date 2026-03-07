const { createClient } = require("@supabase/supabase-js");
require("dotenv").config(); // Load environment variables from .env file

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error(
		"Missing Supabase server credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env"
	);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Export the storage module
module.exports = supabase.storage;
