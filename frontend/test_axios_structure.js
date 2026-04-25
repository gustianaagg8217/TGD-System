#!/usr/bin/env node
/**
 * Quick test: Verify axios response structure
 * Run this to confirm response.data.items structure
 */

const axios = require('axios');

async function testResponse() {
  const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1'
  });

  // Add token
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OX0.mocktoken';
  
  try {
    console.log('\n🔍 Testing Axios Response Structure\n');
    
    const response = await api.get('/assets', {
      params: { skip: 0, limit: 100 },
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Response Object Structure:');
    console.log('   Keys:', Object.keys(response));
    
    if (response.data) {
      console.log('\n📦 response.data Structure:');
      console.log('   Keys:', Object.keys(response.data));
      
      if (response.data.items) {
        console.log(`\n✅ CORRECT: response.data.items exists!`);
        console.log(`   Count: ${response.data.items.length}`);
        console.log(`   Total: ${response.data.total}`);
      }
    }

    console.log('\n⚠️ Testing wrong path (response.items):');
    if (response.items) {
      console.log('   ✅ response.items exists');
    } else {
      console.log('   ❌ response.items DOES NOT exist (as expected!)');
      console.log('   Must use response.data.items instead');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testResponse();
