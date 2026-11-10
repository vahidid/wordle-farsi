#!/usr/bin/env bash
set -e

KEYSTORE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEYSTORE_FILE="$KEYSTORE_DIR/release.keystore"
ALIAS="wordlefarsi"
STORE_PASS="${KEYSTORE_PASSWORD:-wordlefarsi123}"
KEY_PASS="${KEY_PASSWORD:-wordlefarsi123}"

echo "=================================================="
echo "    Wordle Farsi - TWA Keystore Generator"
echo "=================================================="

if [ -f "$KEYSTORE_FILE" ]; then
    echo "Keystore already exists at: $KEYSTORE_FILE"
else
    echo "Generating new release keystore..."
    keytool -genkeypair \
        -v \
        -keystore "$KEYSTORE_FILE" \
        -alias "$ALIAS" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass "$STORE_PASS" \
        -keypass "$KEY_PASS" \
        -dname "CN=Wordle Farsi, OU=App, O=WordleFarsi, L=Tehran, ST=Tehran, C=IR"

    echo "Release keystore generated successfully at: $KEYSTORE_FILE"
fi

echo ""
echo "Extracting SHA-256 Fingerprint for Digital Asset Links..."
SHA256_FINGERPRINT=$(keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$ALIAS" -storepass "$STORE_PASS" | grep "SHA256:" | head -n 1 | awk '{print $2}')

echo "--------------------------------------------------"
echo "SHA-256 Fingerprint:"
echo "$SHA256_FINGERPRINT"
echo "--------------------------------------------------"
echo ""
echo "Put this fingerprint in: public/.well-known/assetlinks.json"
echo "and src/app/.well-known/assetlinks.json/route.ts :"
echo ""
echo "  \"sha256_cert_fingerprints\": ["
echo "    \"$SHA256_FINGERPRINT\""
echo "  ]"
echo ""
echo "=================================================="
