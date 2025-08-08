#!/bin/bash

# Secure Voting Application Demo Script
# This script sets up and demonstrates the secure voting application

echo "🗳️  Secure Web-Based Voting Application Demo"
echo "============================================="
echo ""

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "✅ Docker is available"
    
    # Check if Docker Compose is available
    if command -v docker-compose &> /dev/null; then
        echo "✅ Docker Compose is available"
        echo ""
        
        echo "🚀 Starting the secure voting application..."
        echo "This will start:"
        echo "  - PostgreSQL Database (port 5432)"
        echo "  - Backend API (port 3001)"
        echo "  - Frontend App (port 3000)"
        echo ""
        
        # Start all services
        docker-compose up -d
        
        echo "⏳ Waiting for services to start..."
        sleep 15
        
        echo "🔧 Setting up database with sample data..."
        # Initialize database
        docker-compose exec -T backend npm run seed
        
        echo ""
        echo "🎉 Application is ready!"
        echo ""
        echo "📱 Access Points:"
        echo "  Frontend:    http://localhost:3000"
        echo "  Backend API: http://localhost:3001"
        echo "  API Docs:    http://localhost:3001/api-docs"
        echo ""
        echo "👤 Demo Accounts:"
        echo "  Admin:  admin@example.com / admin123"
        echo "  Voter:  voter@example.com / voter123"
        echo ""
        echo "🔒 Security Features Enabled:"
        echo "  ✅ End-to-end encryption (AES-256)"
        echo "  ✅ Blockchain-style vote ledger"
        echo "  ✅ JWT authentication"
        echo "  ✅ Rate limiting"
        echo "  ✅ CSRF protection"
        echo "  ✅ Input sanitization"
        echo "  ✅ Audit logging"
        echo ""
        echo "🛑 To stop the application: docker-compose down"
        
    else
        echo "❌ Docker Compose not found. Please install Docker Compose."
        exit 1
    fi
else
    echo "❌ Docker not found. Please install Docker."
    echo ""
    echo "Alternative setup (manual):"
    echo "1. Install Node.js 18+ and PostgreSQL"
    echo "2. Create database: createdb secure_voting"
    echo "3. Backend: cd backend && npm install && npm run dev"
    echo "4. Frontend: cd frontend && npm install && npm run dev"
    exit 1
fi