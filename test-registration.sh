#!/bin/bash

# Test the new registration endpoints

echo "🧪 Testing New Registration System..."
echo ""

# Test Job Seeker Registration
echo "1️⃣ Testing Job Seeker Registration..."
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Job Seeker",
    "email": "testjobseeker@demo.com",
    "password": "test123",
    "role": "jobseeker",
    "phone": "555-0123",
    "location": "New York, NY",
    "experienceLevel": "Some Experience",
    "skills": ["Customer Service", "Physical Labor", "Team Work"]
  }' | jq .

echo ""
echo "2️⃣ Testing Employer Registration..."
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Manager",
    "email": "testemployer@demo.com", 
    "password": "test123",
    "role": "employer",
    "phone": "555-0456",
    "location": "Los Angeles, CA",
    "companyName": "Test Company Inc",
    "industry": "Manufacturing",
    "companySize": "51-200",
    "website": "https://www.testcompany.com"
  }' | jq .

echo ""
echo "✅ Registration tests complete!"