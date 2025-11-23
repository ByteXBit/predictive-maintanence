#!/bin/bash
# Comprehensive test script for all endpoints

echo "=== Testing Predictive Maintenance API ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "Response: $body"
        return 1
    fi
}

# Test Next.js API endpoints
echo "=== Next.js API Endpoints ==="
test_endpoint "Health Check" "GET" "http://localhost:3000/api/health" ""
test_endpoint "Telemetry for Machine 1" "GET" "http://localhost:3000/api/telemetry/1?startDate=2024-01-01&endDate=2024-01-31" ""
test_endpoint "Prediction for Machine 1" "GET" "http://localhost:3000/api/machines/1/predict?startDate=2024-01-01&endDate=2024-01-31" ""

# Test Express API endpoints
echo ""
echo "=== Express API Endpoints ==="
test_endpoint "Express Health" "GET" "http://localhost:3001/health" ""
test_endpoint "Login" "POST" "http://localhost:3001/api/auth/login" '{"email":"manager@example.com","password":"Password123!"}'

# Test Python ML Service
echo ""
echo "=== Python ML Service ==="
test_endpoint "ML Health" "GET" "http://localhost:5000/health" ""
test_endpoint "ML Predict" "POST" "http://localhost:5000/predict" '{"machineId":"1","telemetry":{"air_temperature":300,"process_temperature":310,"rotational_speed":1500,"torque":40,"tool_wear":0,"type":0}}'

echo ""
echo "=== Test Complete ==="

