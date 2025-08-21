# Permit Package Manager (PMS Tracker)

A comprehensive, cross-platform permit package tracking and organizing application built with React frontend and Node.js backend. This solution provides efficient management of construction permit packages across devices with cloud-backed storage, county-specific checklists, and robust file management.

## 🚀 Features

### Core Functionality
- **Permit Management**: Create, track, and manage permit packages
- **County-Specific Checklists**: Automatic checklist generation based on county and project type
- **File Management**: Upload, organize, and track required documents
- **Status Tracking**: Monitor permit status from draft to completion
- **Offline Support**: Work offline with automatic sync when connection is restored
- **Florida Counties**: Complete coverage of all 67 Florida counties with comprehensive permit requirements
- **Admin Controls**: Full user management and system administration capabilities

### User Experience
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Real-time Updates**: Live status updates and notifications
- **Mobile Responsive**: Optimized for all device sizes
- **Intuitive Navigation**: Easy-to-use interface for permit management

### Technical Features
- **JWT Authentication**: Secure user authentication and authorization
- **RESTful API**: Well-structured backend API with validation
- **Database**: PostgreSQL with Sequelize ORM
- **File Storage**: Local and S3-compatible storage options
- **Performance**: Optimized queries and caching strategies

## 🏗️ Architecture

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── server/                 # Node.js backend
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── scripts/           # Database scripts
│   └── uploads/           # File upload directory
└── docker-compose.yml     # Development environment
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form handling and validation
- **Lucide React** - Beautiful icons
- **Framer Motion** - Smooth animations

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **Sequelize** - ORM for database operations
- **JWT** - JSON Web Token authentication
- **Multer** - File upload handling
- **Bcrypt** - Password hashing

### Development Tools
- **Docker** - Containerization
- **ESLint** - Code linting
- **Nodemon** - Development server
- **Concurrently** - Run multiple commands

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 15+ (or Docker)
- **Git** for version control

## 🚀 Quick Start

### Option 1: Interactive Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pms-tracker
   ```

2. **Run the interactive setup script**
   ```bash
   # Make the script executable (first time only)
   chmod +x setup.sh
   
   # Run the interactive setup
   ./setup.sh
   ```

   This script will present you with options:
   - 🐳 **Docker Setup**: Full containerized environment (recommended)
   - 💻 **Local Setup**: Uses your local PostgreSQL installation
   - 📚 **View Instructions**: Manual setup steps

### Option 2: Docker Setup (Automated)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pms-tracker
   ```

2. **Run Docker setup**
   ```bash
   chmod +x setup-docker.sh
   ./setup-docker.sh
   ```

   This will:
   - Install dependencies
   - Set up Docker environment
   - Start PostgreSQL container
   - Seed database with Florida counties
   - Start the full application

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

**Docker Management Commands:**
```bash
docker-compose up -d      # Start all services
docker-compose down       # Stop all services
docker-compose logs -f    # View logs
docker-compose restart    # Restart services
```

### Option 3: Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pms-tracker
   ```

2. **Run local setup**
   ```bash
   chmod +x setup-local.sh
   ./setup-local.sh
   ```

   This will:
   - Check PostgreSQL installation
   - Create database and user
   - Install dependencies
   - Set up local environment
   - Seed database with Florida counties

3. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

**Local Setup Requirements:**
- PostgreSQL 15+ installed and running
- Node.js 18+ and npm
- Local database access permissions

### Switching Between Setup Methods

You can easily switch between Docker and local setups:

**From Docker to Local:**
```bash
# Stop Docker containers
docker-compose down

# Run local setup
./setup-local.sh
```

**From Local to Docker:**
```bash
# Stop local servers (Ctrl+C)
# Run Docker setup
./setup-docker.sh
```

**Environment Files:**
- `env.docker` - For Docker setup
- `env.local` - For local setup
- `.env` - Active configuration (auto-created)

### Manual Setup (Advanced Users)
   ```bash
   git clone <repository-url>
   cd pms-tracker
   npm run install-all
   ```

2. **Set up environment variables**
   ```bash
   cd server
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb permit_manager
   
   # Seed initial data
   npm run seed
   ```

4. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/permit_manager

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# AWS S3 Configuration (optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
```

### Database Setup

The application includes comprehensive seeding scripts with:

#### Complete Florida Coverage
- **All 67 Florida counties** with real contact information
- **County-specific permit checklists** (24 comprehensive requirements per county)
- **Realistic processing times** based on county size and complexity
- **Florida Building Code compliance** requirements
- **Hurricane impact resistance** specifications

#### Seeding Commands
```bash
# Seed everything (recommended)
npm run seed-all

# Seed only Florida counties
npm run seed-florida

# Create admin user
npm run create-admin

# Create demo user
npm run create-demo
```

#### Sample Data
- Sample counties (CA, FL, TX)
- County-specific permit checklists
- Project type requirements
- Estimated costs and processing times

## 📱 Usage

### Getting Started

1. **Register/Login**: Create an account or sign in
2. **Browse Counties**: Explore available counties and their requirements
3. **Create Permit**: Start a new permit application
4. **Upload Files**: Add required documents and plans
5. **Track Progress**: Monitor permit status and checklist completion

### Key Features

- **Dashboard**: Overview of all permits and quick actions
- **Permit Creation**: Guided workflow for new applications
- **File Management**: Organize and track required documents
- **Checklist Tracking**: Monitor completion of requirements
- **Status Updates**: Real-time permit status tracking

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

### E2E Testing
```bash
# Run with Cypress (if configured)
npm run cypress:open
```

## 📦 Deployment

### Production Build

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Set production environment**
   ```bash
   cd server
   NODE_ENV=production npm start
   ```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

**Production Environment Variables:**
Create a `.env` file in the root directory:
```env
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key-here
CLIENT_URL=https://yourdomain.com
API_URL=https://yourdomain.com
```

### Cloud Deployment

The application is designed for cloud deployment with:
- **AWS S3** for file storage
- **RDS** for database
- **Elastic Beanstalk** or **ECS** for backend
- **CloudFront** for frontend CDN

## 🔑 Login Credentials

### Admin Account
- **Email**: admin@pms-tracker.com
- **Password**: Admin@2024!
- **Role**: System Administrator
- **Access**: Full system control, user management, system statistics

### Demo Account
- **Email**: demo@example.com
- **Password**: demo123
- **Role**: Standard User
- **Access**: Permit management, county browsing, file uploads

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting protection
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: HTTP security headers

## 📊 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connections
- **File Streaming**: Efficient file upload/download
- **Caching**: Redis integration for performance
- **Lazy Loading**: Component and route lazy loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core permit management
- ✅ File upload system
- ✅ County checklists
- ✅ User authentication

### Phase 2 (Next)
- 🔄 Mobile app (React Native)
- 🔄 Offline sync improvements
- 🔄 Advanced reporting
- 🔄 Integration APIs

### Phase 3 (Future)
- 📋 AI-powered document analysis
- 📋 Automated compliance checking
- 📋 Multi-language support
- 📋 Advanced analytics dashboard

---

**Built with ❤️ for construction professionals**
