#!/bin/bash
# Codec8 Monitoring Setup
# Sets up free uptime monitoring via BetterStack or UptimeRobot
#
# Prerequisites: Sign up at https://betterstack.com (free - 10 monitors)
# Then get your API token from: https://betterstack.com/docs/uptime/api/getting-started/

set -e

HEALTH_URL="https://codec8.com/api/health"
SITE_URL="https://codec8.com"

echo "=== Codec8 Monitoring Setup ==="
echo ""

# Check if health endpoint is live
echo "1. Checking health endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✓ Health endpoint is live ($HEALTH_URL)"
  echo "   Response:"
  curl -s "$HEALTH_URL" | python3 -m json.tool 2>/dev/null
else
  echo "   ✗ Health endpoint returned $HTTP_CODE (deploy first)"
fi

echo ""
echo "2. Setting up monitoring..."

if [ -z "$BETTERSTACK_API_TOKEN" ]; then
  echo ""
  echo "   To set up automated monitoring:"
  echo "   a) Sign up free at https://betterstack.com"
  echo "   b) Get API token from Settings → API tokens"
  echo "   c) Run: BETTERSTACK_API_TOKEN=your_token bash scripts/setup-monitoring.sh"
  echo ""
  echo "   Or manually add these monitors in the dashboard:"
  echo "   - Homepage: $SITE_URL (check every 3 min)"
  echo "   - Health:   $HEALTH_URL (check every 3 min)"
  echo "   - Webhook:  ${SITE_URL}/api/stripe/webhook (check every 5 min, expect 405)"
  exit 0
fi

# Create monitors via BetterStack API
echo "   Creating monitors via BetterStack API..."

# Monitor 1: Homepage
curl -s -X POST "https://uptime.betterstack.com/api/v2/monitors" \
  -H "Authorization: Bearer $BETTERSTACK_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$SITE_URL\",
    \"monitor_type\": \"status\",
    \"expected_status_codes\": [200],
    \"check_frequency\": 180,
    \"pronounceable_name\": \"Codec8 Homepage\"
  }" | python3 -m json.tool 2>/dev/null
echo "   ✓ Homepage monitor created"

# Monitor 2: Health endpoint
curl -s -X POST "https://uptime.betterstack.com/api/v2/monitors" \
  -H "Authorization: Bearer $BETTERSTACK_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$HEALTH_URL\",
    \"monitor_type\": \"status\",
    \"expected_status_codes\": [200],
    \"check_frequency\": 180,
    \"pronounceable_name\": \"Codec8 Health Check\"
  }" | python3 -m json.tool 2>/dev/null
echo "   ✓ Health check monitor created"

# Monitor 3: API endpoint
curl -s -X POST "https://uptime.betterstack.com/api/v2/monitors" \
  -H "Authorization: Bearer $BETTERSTACK_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"${SITE_URL}/api/repos\",
    \"monitor_type\": \"status\",
    \"expected_status_codes\": [200, 401],
    \"check_frequency\": 300,
    \"pronounceable_name\": \"Codec8 API\"
  }" | python3 -m json.tool 2>/dev/null
echo "   ✓ API monitor created"

echo ""
echo "=== Done! ==="
echo "View your monitors at: https://uptime.betterstack.com/team/0/monitors"
echo "Set up alert channels (email, Slack, SMS) in the BetterStack dashboard."
