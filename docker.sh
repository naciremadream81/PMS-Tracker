#!/bin/bash

# PMS Tracker Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
}

# Function to start the application
start_app() {
    print_status "Starting PMS Tracker application..."
    
    # Check for port conflicts
    local postgres_port=${POSTGRES_HOST_PORT:-15432}
    if lsof -i :$postgres_port > /dev/null 2>&1; then
        print_warning "Port $postgres_port is already in use. Using default port 15432."
        export POSTGRES_HOST_PORT=15432
    fi
    
    docker-compose up -d
    print_success "Application started successfully!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend: http://localhost:5000"
    print_status "Database: localhost:${POSTGRES_HOST_PORT:-15432}"
}

# Function to stop the application
stop_app() {
    print_status "Stopping PMS Tracker application..."
    docker-compose down
    print_success "Application stopped successfully!"
}

# Function to restart the application
restart_app() {
    print_status "Restarting PMS Tracker application..."
    docker-compose restart
    print_success "Application restarted successfully!"
}

# Function to view logs
view_logs() {
    local service=${1:-""}
    if [ -z "$service" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f
    else
        print_status "Showing logs for $service service..."
        docker-compose logs -f "$service"
    fi
}

# Function to build the application
build_app() {
    print_status "Building PMS Tracker application..."
    docker-compose build --no-cache
    print_success "Application built successfully!"
}

# Function to clean up
cleanup() {
    print_warning "This will remove all containers, networks, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up Docker resources..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup completed successfully!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show status
show_status() {
    print_status "PMS Tracker application status:"
    docker-compose ps
}

# Function to show help
show_help() {
    echo "PMS Tracker Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start the application"
    echo "  stop        Stop the application"
    echo "  restart     Restart the application"
    echo "  logs        Show logs (optional: specify service name)"
    echo "  build       Build the application"
    echo "  cleanup     Clean up Docker resources"
    echo "  status      Show application status"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs server"
    echo "  $0 logs client"
}

# Main script logic
main() {
    # Check prerequisites
    check_docker
    check_docker_compose

    case "${1:-help}" in
        start)
            start_app
            ;;
        stop)
            stop_app
            ;;
        restart)
            restart_app
            ;;
        logs)
            view_logs "$2"
            ;;
        build)
            build_app
            ;;
        cleanup)
            cleanup
            ;;
        status)
            show_status
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
