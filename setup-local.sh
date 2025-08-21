#!/bin/bash

# PMS Tracker Local Setup Script
set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if PostgreSQL is installed
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL is not installed. Please install it first:"
        echo "  Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
        echo "  CentOS/RHEL: sudo yum install postgresql postgresql-server"
        echo "  macOS: brew install postgresql"
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install it first:"
        echo "  Visit: https://nodejs.org/"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install it first:"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

setup_postgres() {
    print_status "Setting up PostgreSQL database..."
    
    # Check if PostgreSQL service is running
    if ! sudo systemctl is-active --quiet postgresql; then
        print_warning "PostgreSQL service is not running. Starting it..."
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    fi
    
    # Create database and user
    print_status "Creating database and user..."
    
    # Switch to postgres user to create database
    sudo -u postgres psql -c "CREATE DATABASE pms_tracker;" 2>/dev/null || print_warning "Database already exists"
    sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres123';" 2>/dev/null || print_warning "User already exists"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pms_tracker TO postgres;" 2>/dev/null || print_warning "Privileges already granted"
    
    print_success "PostgreSQL setup completed"
}

install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install server dependencies
    cd server
    npm install
    cd ..
    
    # Install client dependencies
    cd client
    npm install
    cd ..
    
    print_success "Dependencies installed"
}

setup_environment() {
    print_status "Setting up environment..."
    
    # Copy local environment file
    if [ ! -f .env ]; then
        cp env.local .env
        print_success "Local environment file created (.env)"
    else
        print_warning "Environment file already exists (.env)"
    fi
    
    print_success "Environment setup completed"
}

seed_database() {
    print_status "Seeding database with Florida counties and checklists..."
    
    cd server
    
    # Wait a moment for database to be ready
    sleep 3
    
    # Run the comprehensive seeding script
    npm run seed-all
    
    cd ..
    
    print_success "Database seeding completed"
}

start_application() {
    print_status "Starting application..."
    
    print_success "Setup completed! You can now start the application:"
    echo ""
    echo "  🚀 Start the application:"
    echo "    npm run dev"
    echo ""
    echo "  📊 Or start components separately:"
    echo "    Terminal 1: cd server && npm run dev"
    echo "    Terminal 2: cd client && npm start"
    echo ""
    echo "  🌐 Application will be available at:"
    echo "    Frontend: http://localhost:3000"
    echo "    Backend:  http://localhost:5000"
    echo ""
    echo "  🔑 Login credentials:"
    echo "    Admin: admin@pms-tracker.com / Admin@2024!"
    echo "    Demo:  demo@example.com / demo123"
}

main() {
    echo "🚀 PMS Tracker Local Setup Script"
    echo "================================"
    echo ""
    
    check_prerequisites
    setup_postgres
    install_dependencies
    setup_environment
    seed_database
    start_application
}

main "$@"
