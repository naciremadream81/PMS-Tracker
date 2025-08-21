#!/bin/bash

# PMS Tracker Setup Script - Choose Your Setup Method
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

show_menu() {
    echo ""
    echo "🚀 PMS Tracker Setup"
    echo "===================="
    echo ""
    echo "Choose your setup method:"
    echo ""
    echo "  1) 🐳 Docker Setup (Recommended)"
    echo "     - Uses Docker containers"
    echo "     - No local PostgreSQL required"
    echo "     - Easy to manage and clean up"
    echo ""
    echo "  2) 💻 Local Setup"
    echo "     - Uses local PostgreSQL installation"
    echo "     - Better for development and debugging"
    echo "     - Requires PostgreSQL to be installed"
    echo ""
    echo "  3) 📚 View Setup Instructions"
    echo "     - Manual setup steps"
    echo "     - Troubleshooting tips"
    echo ""
    echo "  4) ❌ Exit"
    echo ""
    read -p "Enter your choice (1-4): " choice
}

docker_setup() {
    print_status "Starting Docker setup..."
    ./setup-docker.sh
}

local_setup() {
    print_status "Starting local setup..."
    ./setup-local.sh
}

show_instructions() {
    echo ""
    echo "📚 PMS Tracker Setup Instructions"
    echo "================================"
    echo ""
    echo "🐳 Docker Setup:"
    echo "  ./setup-docker.sh"
    echo "  - Automatically sets up everything with Docker"
    echo "  - No local PostgreSQL required"
    echo ""
    echo "💻 Local Setup:"
    echo "  ./setup-local.sh"
    echo "  - Requires PostgreSQL to be installed locally"
    echo "  - Better for development and debugging"
    echo ""
    echo "🔧 Manual Setup:"
    echo "  1. Install dependencies: npm run install-all"
    echo "  2. Copy env.local to .env for local setup"
    echo "  3. Set up PostgreSQL database"
    echo "  4. Seed database: cd server && npm run seed-all"
    echo "  5. Start application: npm run dev"
    echo ""
    echo "📊 Database Seeding:"
    echo "  - All 67 Florida counties with contact info"
    echo "  - 1,608 permit checklists (24 per county)"
    echo "  - Admin and demo user accounts"
    echo ""
    echo "🔑 Default Login:"
    echo "  Admin: admin@pms-tracker.com / Admin@2024!"
    echo "  Demo:  demo@example.com / demo123"
    echo ""
    read -p "Press Enter to return to main menu..."
}

main() {
    while true; do
        show_menu
        
        case $choice in
            1)
                docker_setup
                break
                ;;
            2)
                local_setup
                break
                ;;
            3)
                show_instructions
                ;;
            4)
                print_status "Exiting setup..."
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please enter 1, 2, 3, or 4."
                ;;
        esac
    done
}

main "$@"
