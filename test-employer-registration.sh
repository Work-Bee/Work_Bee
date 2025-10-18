#!/bin/bash

# Test Employer Registration - Comprehensive Test
# Tests the new 2-step employer registration flow

echo "🧪 Testing Employer Registration API..."
echo "========================================"
echo ""

# Test Data
COMPANY_NAME="Tech Solutions Pvt Ltd"
OFFICIAL_EMAIL="hr@techsolutions.com"
WEBSITE="https://www.techsolutions.com"
LINKEDIN="https://linkedin.com/company/techsolutions"
CONTACT_NAME="Priya Sharma"
CONTACT_ROLE="HR Manager"
PRIMARY_PHONE="+91 98765 43210"
SECONDARY_PHONE="+91 98765 43211"
PASSWORD="Employer@123"
LOCATION="Bangalore, Karnataka"

echo "📋 Test Case 1: Complete Registration with All Fields"
echo "------------------------------------------------------"

RESPONSE=$(curl -s -X POST http://localhost:5555/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"role\": \"employer\",
    \"name\": \"$CONTACT_NAME\",
    \"email\": \"$OFFICIAL_EMAIL\",
    \"password\": \"$PASSWORD\",
    \"phone\": \"$PRIMARY_PHONE\",
    \"secondaryPhone\": \"$SECONDARY_PHONE\",
    \"location\": \"$LOCATION\",
    \"primaryHasWhatsApp\": true,
    \"secondaryHasWhatsApp\": false,
    \"companyDetails\": {
      \"companyName\": \"$COMPANY_NAME\",
      \"officialEmail\": \"$OFFICIAL_EMAIL\",
      \"website\": \"$WEBSITE\",
      \"linkedInPage\": \"$LINKEDIN\",
      \"contactPersonRole\": \"$CONTACT_ROLE\",
      \"industry\": \"IT\",
      \"companySize\": \"51-200\",
      \"companyAddress\": \"123 Tech Park, Electronic City\",
      \"city\": \"Bangalore\",
      \"state\": \"Karnataka\",
      \"glassdoorUrl\": \"https://glassdoor.com/company/techsolutions\",
      \"otherSocialLink\": \"https://twitter.com/techsolutions\"
    }
  }")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if registration was successful
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Test Case 1: PASSED - Employer registered successfully"
    
    # Extract user ID for verification
    USER_ID=$(echo "$RESPONSE" | jq -r '.data.user.id' 2>/dev/null)
    
    if [ "$USER_ID" != "null" ] && [ -n "$USER_ID" ]; then
        echo "📊 Verifying data in MongoDB..."
        echo ""
        
        # Query MongoDB to verify all fields were saved
        mongosh --quiet work_bee --eval "
            const user = db.users.findOne({_id: ObjectId('$USER_ID')}, {password: 0, __v: 0});
            if (user) {
                print('✅ User found in database');
                print('');
                print('📋 Company Details:');
                print('  Company Name:', user.companyDetails.companyName);
                print('  Official Email:', user.companyDetails.officialEmail);
                print('  Website:', user.companyDetails.website);
                print('  LinkedIn:', user.companyDetails.linkedInPage);
                print('  Contact Role:', user.companyDetails.contactPersonRole);
                print('  Industry:', user.companyDetails.industry);
                print('  Company Size:', user.companyDetails.companySize);
                print('  Address:', user.companyDetails.companyAddress);
                print('  City:', user.companyDetails.city);
                print('  State:', user.companyDetails.state);
                print('  Glassdoor:', user.companyDetails.glassdoorUrl);
                print('  Other Social:', user.companyDetails.otherSocialLink);
                print('');
                print('📞 Contact Details:');
                print('  Contact Person:', user.name);
                print('  Primary Phone:', user.phone);
                print('  Primary WhatsApp:', user.primaryHasWhatsApp);
                print('  Secondary Phone:', user.secondaryPhone);
                print('  Secondary WhatsApp:', user.secondaryHasWhatsApp);
            } else {
                print('❌ User not found in database');
            }
        " 2>/dev/null
        
        echo ""
        echo "🧹 Cleaning up test data..."
        mongosh --quiet work_bee --eval "db.users.deleteOne({_id: ObjectId('$USER_ID')})" > /dev/null 2>&1
        echo "✅ Test data cleaned"
    fi
else
    echo "❌ Test Case 1: FAILED"
    echo "Error: $RESPONSE"
fi

echo ""
echo "========================================"
echo ""

echo "📋 Test Case 2: Registration with Minimum Required Fields"
echo "----------------------------------------------------------"

RESPONSE2=$(curl -s -X POST http://localhost:5555/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"role\": \"employer\",
    \"name\": \"Rajesh Kumar\",
    \"email\": \"rajesh@minimalcompany.com\",
    \"password\": \"Test@123\",
    \"phone\": \"+91 98765 99999\",
    \"secondaryPhone\": \"+91 98765 88888\",
    \"location\": \"Mumbai\",
    \"primaryHasWhatsApp\": true,
    \"companyDetails\": {
      \"companyName\": \"Minimal Company Ltd\",
      \"officialEmail\": \"rajesh@minimalcompany.com\",
      \"linkedInPage\": \"https://linkedin.com/company/minimal\",
      \"contactPersonRole\": \"Owner\"
    }
  }")

echo "Response:"
echo "$RESPONSE2" | jq '.' 2>/dev/null || echo "$RESPONSE2"
echo ""

if echo "$RESPONSE2" | grep -q '"success":true'; then
    echo "✅ Test Case 2: PASSED - Registration with minimum fields successful"
    
    # Clean up
    USER_ID2=$(echo "$RESPONSE2" | jq -r '.data.user.id' 2>/dev/null)
    if [ "$USER_ID2" != "null" ] && [ -n "$USER_ID2" ]; then
        mongosh --quiet work_bee --eval "db.users.deleteOne({_id: ObjectId('$USER_ID2')})" > /dev/null 2>&1
    fi
else
    echo "❌ Test Case 2: FAILED"
fi

echo ""
echo "========================================"
echo "✨ Employer Registration Testing Complete!"
echo "========================================"
