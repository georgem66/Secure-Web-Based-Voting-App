# Secure Web-Based Voting Application

A production-grade secure web-based voting application with advanced cryptographic security, blockchain-inspired vote ledger, and comprehensive network security backbone.

## 🔒 Security Features

- **End-to-End Encryption**: AES-256 payload encryption with RSA key exchange
- **Multi-Factor Authentication**: TOTP/Google Authenticator integration
- **Blockchain-Inspired Ledger**: Immutable vote recording with hash chaining
- **Advanced Security Middleware**: Rate limiting, CSRF protection, SQL injection prevention
- **Comprehensive Audit Logging**: All security events tracked and monitored
- **HTTPS/TLS 1.3 Enforcement**: Secure communication protocols
- **Input Sanitization**: XSS and injection attack prevention

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Secure REST API** with 27+ endpoints
- **JWT Authentication** with refresh tokens
- **PostgreSQL Database** with field-level encryption
- **Blockchain-style Vote Ledger** with immutable hash chains
- **Real-time Results** with WebSocket support
- **Admin Dashboard API** for system management

### Frontend (React + Material UI)
- **Modern Responsive UI** with professional Material Design
- **Secure Authentication Flow** with MFA support
- **Real-time Voting Interface** with confirmation receipts
- **Interactive Results Dashboard** with charts and analytics
- **Admin Panel** with user and candidate management
- **Mobile-first Design** optimized for all devices

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd Secure-Web-Based-Voting-App

# Start all services
docker-compose up -d

# Initialize database with sample data
docker-compose exec backend npm run seed

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Database: localhost:5432
```

### Manual Installation

#### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Database Setup
```bash
# Create database
createdb secure_voting

# Run migrations
cd backend
npm run migrate

# Seed with sample data
npm run seed
```

## 📱 Features

### For Voters
- 🔐 Secure registration with email verification
- 🛡️ Multi-factor authentication setup
- 🗳️ Intuitive voting interface with candidate information
- 📜 Vote confirmation with unique transaction hash
- 📊 Real-time results viewing
- 👤 Profile management with security settings

### For Administrators
- 👥 User management and verification
- 🏛️ Candidate management system
- 📈 Real-time analytics and statistics
- 🔍 Security audit log monitoring
- ⚙️ System configuration and settings
- 📋 Comprehensive reporting tools

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/secure_voting
JWT_SECRET=your-super-secure-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
ENCRYPTION_KEY=your-32-character-encryption-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Secure Voting Platform
```

## 🛡️ Security Implementation

### Cryptographic Security
- **AES-256-GCM** encryption for vote payload
- **RSA-2048** key exchange mechanism
- **bcrypt** password hashing with salt rounds
- **SHA-256** blockchain hash chaining
- **HMAC** message authentication codes

### Network Security
- **Rate limiting** with IP-based throttling
- **CSRF tokens** for state-changing operations
- **SQL parameterization** to prevent injection
- **Input validation** with comprehensive sanitization
- **Security headers** via Helmet.js middleware

### Authentication & Authorization
- **JWT tokens** with short expiration times
- **Refresh token rotation** for session management
- **Role-based access control** (RBAC)
- **MFA requirement** for sensitive operations
- **Session timeout** and concurrent login limits

## 📊 API Documentation

The API is fully documented using Swagger/OpenAPI 3.0. Once the backend is running, access the interactive documentation at:

```
http://localhost:3001/api-docs
```

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/enable-mfa` - MFA setup

#### Voting
- `GET /api/voting/candidates` - Get candidate list
- `POST /api/voting/vote` - Cast encrypted vote
- `GET /api/voting/verify/{hash}` - Verify vote transaction

#### Results
- `GET /api/results/current` - Current election results
- `GET /api/results/statistics` - Voting statistics

#### Admin
- `GET /api/admin/users` - User management
- `POST /api/admin/candidates` - Candidate management
- `GET /api/admin/audit-logs` - Security audit logs

## 🧪 Testing

### Unit Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Security Tests
```bash
# Run security audit
npm audit

# SQL injection tests
npm run security-test

# XSS prevention tests
npm run xss-test
```

## 📈 Performance

- **Frontend**: Optimized React build with code splitting
- **Backend**: Efficient database queries with connection pooling
- **Caching**: Redis integration for session and query caching
- **CDN Ready**: Static assets optimized for CDN delivery

## 🌐 Deployment

### Production Deployment

#### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

#### Cloud Deployment
- **AWS**: ECS/EKS with RDS and CloudFront
- **Google Cloud**: GKE with Cloud SQL and CDN
- **Azure**: AKS with Azure Database and CDN

### SSL/TLS Setup
```bash
# Using Let's Encrypt with Certbot
certbot --nginx -d yourdomain.com
```

## 🔍 Monitoring & Logging

### Security Monitoring
- Real-time intrusion detection
- Failed authentication attempt tracking
- Suspicious activity alerting
- Comprehensive audit trail

### System Monitoring
- Application performance metrics
- Database query optimization
- Resource utilization tracking
- Error rate monitoring

## 📋 Compliance

This application is designed to meet:
- **OWASP Top 10** security standards
- **ISO 27001** information security guidelines
- **NIST Cybersecurity Framework** best practices
- **GDPR** data protection requirements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Development Team

Built with ❤️ for educational purposes demonstrating advanced cybersecurity, encryption, and scalable web application architecture.

---

**Note**: This is a demonstration project for educational purposes. For production use in actual elections, additional security audits, legal compliance reviews, and professional security assessments would be required.