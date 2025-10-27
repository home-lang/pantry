#!/usr/bin/env python3
import sys
import ssl
import hashlib

print(f"Python version: {sys.version}")
print(f"Python executable: {sys.executable}")
print(f"SSL version: {ssl.OPENSSL_VERSION}")
print(f"Hash test: {hashlib.sha256(b'test').hexdigest()}")
print("✅ Python is working correctly!")
