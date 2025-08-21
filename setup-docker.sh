#!/bin/bash

# PMS Tracker Docker Setup Script
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
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first:"
        echo "  Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install it first:"
        echo "  Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
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
    
    # Copy Docker environment file
    if [ ! -f .env ]; then
        cp env.docker .env
        print_success "Docker environment file created (.env)"
    else
        print_warning "Environment file already exists (.env)"
    fi
    
    print_success "Environment setup completed"
}

start_application() {
    print_status "Starting application with Docker Compose..."
    
    # Start the database first
    docker-compose up -d postgres
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Seed the database
    print_status "Seeding database with Florida counties and checklists..."
    cd server
    npm run seed-all
    cd ..
    
    # Start the full application
    print_status "Starting full application..."
    docker-compose up -d
    
    print_success "Application started successfully!"
    echo ""
    echo "  🌐 Application is now running at:"
    echo "    Frontend: http://localhost:3000"
    echo "    Backend:  http://localhost:5000"
    echo ""
    echo "  🔑 Login credentials:"
    echo "    Admin: admin@pms-tracker.com / Admin@2024!"
    echo "    Demo:  demo@example.com / demo123"
    echo ""
    echo "  📊 Docker containers:"
    echo "    View logs: docker-compose logs -f"
    echo "    Stop:      docker-compose down"
    echo "    Restart:   docker-compose restart"
}

main() {
    echo "🐳 PMS Tracker Docker Setup Script"
    echo "================================="
    echo ""
    
    check_prerequisites
    install_dependencies
    setup_environment
    start_application
}

main "$@"
