#!/bin/bash

# Test script for new job seeker registration with all fields

echo "Testing Job Seeker Registration with New Fields..."
echo "=================================================="

# Test 1: Minimal required fields only
echo -e "\n1. Testing with MINIMAL required fields (Step 1 & 2 only)..."
response1=$(curl -s -X POST http://localhost:5555/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User Minimal",
    "email": "testminimal@example.com",
    "password": "Test123456",
    "phone": "1234567890",
    "role": "jobseeker",
    "location": "New York, NY",
    "yearsOfExperience": 2,
    "experienceLevel": "Some Experience",
    "skills": ["Customer Service", "Communication"]
  }')

echo "$response1" | jq '.'

# Test 2: Full registration with all optional fields
echo -e "\n2. Testing with ALL fields (Step 1, 2 & 3 complete)..."
response2=$(curl -s -X POST http://localhost:5555/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User Complete",
    "email": "testcomplete@example.com",
    "password": "Test123456",
    "phone": "+1-555-123-4567",
    "role": "jobseeker",
    "location": "San Francisco, CA",
    "yearsOfExperience": 5,
    "experienceLevel": "Experienced",
    "skills": ["Project Management", "Team Leadership", "Communication"],
    "jobTitle": "Senior Project Manager",
    "preferredLocations": ["San Francisco", "Los Angeles", "Seattle"],
    "education": {
      "degree": "Bachelor of Science",
      "institution": "Stanford University",
      "year": 2018
    },
    "linkedinUrl": "https://linkedin.com/in/testuser",
    "githubUrl": "https://github.com/testuser",
    "portfolioUrl": "https://testuser.com",
    "languages": ["English", "Spanish", "French"],
    "expectedSalary": {
      "min": 80000,
      "max": 120000,
      "currency": "USD",
      "period": "year"
    },
    "availability": "Within 30 days",
    "workPreference": "Hybrid",
    "willingToRelocate": "Maybe",
    "bio": "Experienced project manager with 5+ years in tech. Passionate about leading teams and delivering results."
  }')

echo "$response2" | jq '.'

# Test 3: Validation error test - missing required fields
echo -e "\n3. Testing VALIDATION - missing required fields (should fail)..."
response3=$(curl -s -X POST http://localhost:5555/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User Invalid",
    "email": "testinvalid@example.com",
    "password": "Test123456",
    "role": "jobseeker"
  }')

echo "$response3" | jq '.'

echo -e "\n=================================================="
echo "Testing Complete!"
echo ""
echo "Summary:"
echo "- Test 1: Minimal registration (required fields only)"
echo "- Test 2: Complete registration (all optional fields)"
echo "- Test 3: Validation test (missing required fields)"
echo ""
echo "Check the responses above to verify:"
echo "  ✓ success: true for valid registrations"
echo "  ✓ user data includes all new profile fields"
echo "  ✓ validation errors for incomplete data"
