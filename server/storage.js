const storage = require('./config/supabaseConfig');  // Make sure your Supabase client is correctly configured

// Fetch files from Supabase
const fetchFiles = async () => {
    const { data, error } = await storage.from('op').list('', { limit: 100 });

    if (error) {
        console.error('Error fetching files:', error.message);
        return [];
    }
    return data;  // Return the list of files
}

// Log the files after resolving the promise
const logFiles = async () => {
    const files = await fetchFiles();  // Wait for the files to be fetched
    console.log("Files:", files);  // Log the fetched files
}

logFiles();  // Call the function to log files
