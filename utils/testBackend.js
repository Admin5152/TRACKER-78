// utils/testBackend.js
import { API_BASE_URL } from './api';

export const testBackendConnection = async () => {
  console.log('Testing backend connection...');
  
  const tests = [
    {
      name: 'Health Check',
      url: `${API_BASE_URL}/auth/status`,
      method: 'GET',
      expectedStatus: 200,
    },
    {
      name: 'Get All Users',
      url: `${API_BASE_URL}/users`,
      method: 'GET',
      expectedStatus: 200,
    },
    {
      name: 'Create Circle (requires auth)',
      url: `${API_BASE_URL}/circles`,
      method: 'POST',
      expectedStatus: 401, // Should require authentication
    },
  ];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      const response = await fetch(test.url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(test.method === 'POST' && {
          body: JSON.stringify({
            name: 'Test Circle',
            description: 'Test Description',
          }),
        }),
      });

      console.log(`  Status: ${response.status}`);
      console.log(`  Expected: ${test.expectedStatus}`);
      
      if (response.status === test.expectedStatus) {
        console.log(`  ✅ ${test.name} - PASSED`);
      } else {
        console.log(`  ❌ ${test.name} - FAILED (got ${response.status}, expected ${test.expectedStatus})`);
      }

      if (response.ok) {
        try {
          const data = await response.json();
          console.log(`  Data:`, data);
        } catch (e) {
          const text = await response.text();
          console.log(`  Response: ${text}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ ${test.name} - ERROR: ${error.message}`);
    }
    console.log('');
  }
};

export const testAuthenticatedEndpoints = async (authToken) => {
  console.log('Testing authenticated endpoints...');
  
  const tests = [
    {
      name: 'Update Location',
      url: `${API_BASE_URL}/locations/update`,
      method: 'POST',
      body: {
        latitude: 5.6037,
        longitude: -0.1870,
        timestamp: new Date().toISOString(),
      },
    },
    {
      name: 'Create Circle',
      url: `${API_BASE_URL}/circles`,
      method: 'POST',
      body: {
        name: 'Test Circle',
        description: 'Test Description',
      },
    },
  ];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      const response = await fetch(test.url, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: JSON.stringify(test.body),
      });

      console.log(`  Status: ${response.status}`);
      
      if (response.ok) {
        console.log(`  ✅ ${test.name} - PASSED`);
        try {
          const data = await response.json();
          console.log(`  Data:`, data);
        } catch (e) {
          const text = await response.text();
          console.log(`  Response: ${text}`);
        }
      } else {
        console.log(`  ❌ ${test.name} - FAILED (${response.status})`);
        try {
          const errorData = await response.json();
          console.log(`  Error:`, errorData);
        } catch (e) {
          const text = await response.text();
          console.log(`  Error: ${text}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ ${test.name} - ERROR: ${error.message}`);
    }
    console.log('');
  }
}; 