
// const { createClient } = require("@supabase/supabase-js")node;
import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";
dotenv.config();
const supabaseUrl = 'https://khuqzmcpzrrgepqxozka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtodXF6bWNwenJyZ2VwcXhvemthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0OTcwMjEsImV4cCI6MjA0MTA3MzAyMX0.KHlDa-UfKTv8YjMb48ipl5AOeAiU58YPfpy360_mpoE'
;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);





const userID = '67c437f93f86584eff0bd8b2'

const { data, error } = await supabase.storage
  .from('users12')
  .list(`${userID}/images`, {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  })

console.log(data)
console.log(error)
