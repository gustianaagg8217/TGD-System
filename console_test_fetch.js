// 🧪 Browser Console Test Script
// Copy paste this entire script into browser console (F12 → Console tab)

console.log('🔍 Testing Asset Fetch...\n');

async function testAssetFetch() {
  try {
    console.log('1️⃣  Getting auth token from localStorage...');
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      console.error('❌ No auth token! User might not be logged in.');
      return;
    }
    
    console.log('✅ Token found:', token.substring(0, 30) + '...');
    
    console.log('\n2️⃣  Fetching from /api/v1/assets...');
    const response = await fetch('http://localhost:8000/api/v1/assets', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Status:', response.status);
    
    if (!response.ok) {
      console.error(`❌ API returned ${response.status}`);
      const error = await response.text();
      console.error('Error:', error);
      return;
    }
    
    const data = await response.json();
    
    console.log('\n3️⃣  Response Data:');
    console.log('Total:', data.total);
    console.log('Items count:', data.items?.length || 0);
    console.log('Response structure:', Object.keys(data));
    
    if (data.items && data.items.length > 0) {
      console.log('\n4️⃣  Asset Types Found:');
      const types = {};
      data.items.forEach(asset => {
        types[asset.type] = (types[asset.type] || 0) + 1;
      });
      console.table(types);
      
      console.log('\n5️⃣  First 3 Assets:');
      data.items.slice(0, 3).forEach((asset, i) => {
        console.log(`${i+1}. ${asset.name} (${asset.type})`);
      });
      
      console.log('\n✅ FETCH SUCCESSFUL!');
    } else {
      console.warn('⚠️ No items in response');
    }
    
  } catch (err) {
    console.error('❌ Fetch Error:', err.message);
    console.error('Full error:', err);
  }
}

// Run test
testAssetFetch();
