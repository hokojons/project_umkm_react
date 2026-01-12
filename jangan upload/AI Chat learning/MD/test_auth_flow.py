#!/usr/bin/env python3
import requests
import random
import json

BASE_URL = "http://localhost:8000/api"

# Test data
test_email = f"test_flow_{random.randint(10000, 99999)}@test.com"
test_phone = "6281234567890"
test_password = "password123"

print(f"\n🔍 Test Configuration:")
print(f"   Email: {test_email}")
print(f"   Phone: {test_phone}")
print(f"   Password: {test_password}\n")

# Step 1: Send OTP
print("=" * 60)
print("1️⃣ SENDING OTP...")
print("=" * 60)
resp1 = requests.post(
    f"{BASE_URL}/auth/send-otp-register",
    json={"no_whatsapp": test_phone}
)
print(f"Status: {resp1.status_code}")
data1 = resp1.json()
print(f"Response: {json.dumps(data1, indent=2)}")

if not data1.get("success"):
    print("❌ Failed to send OTP!")
    exit(1)

otp_code = data1["data"]["code"]
print(f"\n✅ OTP Code Generated: {otp_code}\n")

# Step 2: Verify OTP and Create Account
print("=" * 60)
print("2️⃣ VERIFYING OTP & CREATING ACCOUNT...")
print("=" * 60)
resp2 = requests.post(
    f"{BASE_URL}/auth/verify-otp-register",
    json={
        "no_whatsapp": test_phone,
        "code": otp_code,
        "email": test_email,
        "nama": "Test User",
        "password": test_password,
        "type": "user"
    }
)
print(f"Status: {resp2.status_code}")
data2 = resp2.json()
print(f"Response: {json.dumps(data2, indent=2)}")

if not data2.get("success"):
    print("❌ Failed to verify OTP!")
    exit(1)

print(f"\n✅ Account Created Successfully\n")

# Step 3: Login
print("=" * 60)
print("3️⃣ TESTING LOGIN...")
print("=" * 60)
resp3 = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": test_email,
        "password": test_password
    }
)
print(f"Status: {resp3.status_code}")
data3 = resp3.json()
print(f"Response: {json.dumps(data3, indent=2)}")

if not data3.get("success"):
    print("❌ Login failed!")
    exit(1)

print(f"\n✅ Login Successful!\n")

# Summary
print("=" * 60)
print("✨ ALL TESTS PASSED!")
print("=" * 60)
print(f"Created user: {test_email}")
print(f"Phone verified: {test_phone}")
print(f"Auto-login works: ✅")
