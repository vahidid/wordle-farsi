#!/usr/bin/env bash
set -e

KEYSTORE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEYSTORE_FILE="$KEYSTORE_DIR/release.keystore"
KEY_PROPS="$KEYSTORE_DIR/../key.properties"

# Read properties from key.properties if available
if [ -f "$KEY_PROPS" ]; then
    STORE_PASS="${KEYSTORE_PASSWORD:-$(grep '^storePassword=' "$KEY_PROPS" | cut -d'=' -f2-)}"
    KEY_PASS="${KEY_PASSWORD:-$(grep '^keyPassword=' "$KEY_PROPS" | cut -d'=' -f2-)}"
    ALIAS="${KEY_ALIAS:-$(grep '^keyAlias=' "$KEY_PROPS" | cut -d'=' -f2-)}"
else
    STORE_PASS="${KEYSTORE_PASSWORD:-}"
    KEY_PASS="${KEY_PASSWORD:-}"
    ALIAS="${KEY_ALIAS:-wordlefarsi}"
fi

if [ -z "$STORE_PASS" ] || [ -z "$KEY_PASS" ]; then
    echo "ERROR: Password not found in environment or android/key.properties"
    exit 1
fi

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
