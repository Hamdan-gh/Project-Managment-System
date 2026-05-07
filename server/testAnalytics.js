import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Test the analytics endpoints
const testAnalytics = async () => {
  try {
    console.log('Testing analytics endpoints...');
    
    const baseUrl = 'http://localhost:5000/api';
    
    // You would need to get an admin token first
    // For now, let's just test the connection
    const response = await fetch(`${baseUrl}/test`);
    const data = await response.json();
    
    console.log('API Test Response:', data);
    
    // Test analytics endpoint (this will fail without auth token)
    try {
      const analyticsResponse = await fetch(`${baseUrl}/analytics/dashboard-stats`);
      console.log('Analytics endpoint status:', analyticsResponse.status);
    } catch (error) {
      console.log('Analytics endpoint requires authentication (expected)');
    }
    
  } catch (error) {
    console.error('Error testing analytics:', error);
  }
};

testAnalytics();