#!/usr/bin/env python3

"""
Simple HTTP Server for Karthik Nagapuri Portfolio
Run this script to start the development server
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

PORT = 8000
DIRECTORY = os.getcwd()

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def log_message(self, format, *args):
        # Custom logging format
        print(f"[SERVER] {self.address_string()} - {format % args}")

def main():
    print("=" * 60)
    print("🚀 KARTHIK NAGAPURI PORTFOLIO SERVER")
    print("=" * 60)
    print(f"📁 Serving from: {DIRECTORY}")
    print(f"🌐 Server URL: http://localhost:{PORT}")
    print(f"🔧 Admin Panel: http://localhost:{PORT}/admin.html")
    print(f"🧪 Test Connection: http://localhost:{PORT}/test-supabase-connection.html")
    print("=" * 60)

    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print("✅ Server started successfully!")
            print("📝 Press Ctrl+C to stop the server")
            print("")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
