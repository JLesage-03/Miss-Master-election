// supabase-config.js
const SUPABASE_CONFIG = {
    url: 'YOUR_PROJECT_URL_HERE',  // Replace with your URL
    key: 'YOUR_ANON_KEY_HERE'      // Replace with your key
};

// Initialize Supabase client
const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url, 
    SUPABASE_CONFIG.key
);

// Export for use in other files
window.supabaseClient = supabase;