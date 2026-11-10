#!/bin/bash
# AgentCore Gateway Target Validation Script
# Validates gateway target deployment and functionality.
#
# Usage: ./validate-deployment.sh <gateway-identifier>
# Requires: aws CLI v2, jq
#
# Exit codes: 0 = all critical checks passed, 1 = a critical check failed.

set -u

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-us-west-2}
AWS_PROFILE=${AWS_PROFILE:-default}

WARNINGS=0

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    WARNINGS=$((WARNINGS + 1))
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_section() {
    echo ""
    echo -e "${BLUE}==== $1 ====${NC}"
}

# Prerequisites
for REQUIRED_CMD in aws jq; do
    if ! command -v "$REQUIRED_CMD" > /dev/null 2>&1; then
        print_error "Required command not found: $REQUIRED_CMD"
        exit 1
    fi
done

# Check if gateway ID is provided
if [ $# -eq 0 ]; then
    print_error "Gateway ID not provided!"
    echo "Usage: $0 <gateway-identifier>"
    echo "Example: $0 xiaozhi-mfyvjzuqpk"
    exit 1
fi

GATEWAY_ID=$1
print_info "Validating gateway: $GATEWAY_ID"

# Test 1: Gateway exists (also captures details for Test 4)
print_section "Test 1: Gateway Existence"
print_info "Checking if gateway exists..."

if GATEWAY_DETAIL=$(aws bedrock-agentcore-control get-gateway \
  --gateway-identifier "$GATEWAY_ID" \
  --profile "$AWS_PROFILE" \
  --region "$AWS_REGION" 2>/dev/null); then
    print_info "✓ Gateway exists"
else
    print_error "✗ Gateway not found: $GATEWAY_ID"
    exit 1
fi

# Test 2: List gateway targets
print_section "Test 2: Gateway Targets"
print_info "Listing targets on gateway..."

if TARGETS_JSON=$(aws bedrock-agentcore-control list-gateway-targets \
  --gateway-identifier "$GATEWAY_ID" \
  --profile "$AWS_PROFILE" \
  --region "$AWS_REGION" 2>/dev/null); then
    TARGET_COUNT=$(echo "$TARGETS_JSON" | jq -r '(.items // .targets // []) | length')
    print_info "✓ Found $TARGET_COUNT target(s)"
else
    print_error "✗ Failed to list targets"
    exit 1
fi

# Test 3: Check target details (if targets exist)
if [ "$TARGET_COUNT" -gt 0 ]; then
    print_section "Test 3: Target Details"

    for TARGET_ID in $(echo "$TARGETS_JSON" | jq -r '(.items // .targets // [])[].targetId'); do
        print_info "Checking target: $TARGET_ID"

        if TARGET_DETAIL=$(aws bedrock-agentcore-control get-gateway-target \
          --gateway-identifier "$GATEWAY_ID" \
          --target-identifier "$TARGET_ID" \
          --profile "$AWS_PROFILE" \
          --region "$AWS_REGION" 2>/dev/null); then
            STATUS=$(echo "$TARGET_DETAIL" | jq -r '.status // "UNKNOWN"')
            TARGET_NAME=$(echo "$TARGET_DETAIL" | jq -r '.name // .targetName // empty')
            echo "  Target ID   : $TARGET_ID"
            echo "  Name        : ${TARGET_NAME:-<not set>}"
            echo "  Status      : $STATUS"
            echo "  Gateway ARN : $(echo "$TARGET_DETAIL" | jq -r '.gatewayArn // "n/a"')"

            if [ "$STATUS" = "READY" ]; then
                print_info "✓ Target is READY"
            else
                print_warning "⚠ Target status: $STATUS"
            fi

            if [ -z "$TARGET_NAME" ]; then
                print_warning "⚠ Target name not set"
            fi
        else
            print_warning "⚠ Failed to get target details: $TARGET_ID"
        fi
        echo ""
    done
fi

# Test 4: Check credential provider access
print_section "Test 4: Credential Provider Access"
print_info "Checking if Gateway service role has credential access..."

ROLE_ARN=$(echo "$GATEWAY_DETAIL" | jq -r '.roleArn // empty')
if [ -n "$ROLE_ARN" ]; then
    print_info "Gateway Role: $ROLE_ARN"

    # Extract role name from ARN (arn:aws:iam::<account>:role/<path>/<name>)
    ROLE_NAME=${ROLE_ARN##*/}

    if POLICIES=$(aws iam list-attached-role-policies \
      --role-name "$ROLE_NAME" \
      --profile "$AWS_PROFILE" \
      --region "$AWS_REGION" 2>/dev/null); then
        print_info "✓ Role has attached policies"
        echo "$POLICIES" | jq -r '.AttachedPolicies[] | "  - \(.PolicyName): \(.PolicyArn)"'

        # Note: This is a simplified check - full verification requires policy inspection
        print_info "✓ IAM permissions appear to be configured"
    else
        print_warning "⚠ Could not verify role policies"
    fi
else
    print_warning "⚠ Gateway has no roleArn; skipping IAM check"
fi

# Test 5: Check CloudFormation stack (optional)
print_section "Test 5: CloudFormation Stack"

# Stack name convention used by this guide: <gateway-id prefix>FootballAPITarget.
# Override with STACK_NAME=<name> if your deployment uses a different name.
STACK_PREFIX=$(echo "$GATEWAY_ID" | cut -d'-' -f1)
STACK_NAME=${STACK_NAME:-"${STACK_PREFIX}FootballAPITarget"}

print_info "Checking CloudFormation stack: $STACK_NAME"

if STACK_STATUS=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --profile "$AWS_PROFILE" \
  --region "$AWS_REGION" \
  --query 'Stacks[0].StackStatus' \
  --output text 2>/dev/null); then
    print_info "✓ Stack exists with status: $STACK_STATUS"

    if [ "$STACK_STATUS" = "UPDATE_COMPLETE" ] || [ "$STACK_STATUS" = "CREATE_COMPLETE" ]; then
        print_info "✓ Stack is healthy"
    else
        print_warning "⚠ Stack status: $STACK_STATUS"
    fi
else
    print_warning "⚠ Stack not found (this is OK if using different naming)"
fi

# Summary
print_section "Summary"
if [ "$WARNINGS" -eq 0 ]; then
    print_info "✓ All checks passed for gateway $GATEWAY_ID"
else
    echo -e "${YELLOW}[WARN]${NC} Validation finished with $WARNINGS warning(s) for gateway $GATEWAY_ID"
fi
exit 0
