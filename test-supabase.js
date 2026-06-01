// Test Supabase connection
const { supabase } = require('./src/lib/supabase');

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error) {
      console.error('Supabase error:', error);
    } else {
      console.log('Connection successful!');
    }
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
}

testConnection();
