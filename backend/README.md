# Secure Web-Based Voting App Backend

This is the backend component of the Secure Web-Based Voting App, providing a robust API for user authentication, voting, election management, and result reporting.

## Features

- **Secure Authentication**: JWT-based authentication with refresh tokens and MFA support
- **Election Management**: Create, update, and manage elections
- **Secure Voting**: Encrypted voting with blockchain-style immutability
- **Result Reporting**: Real-time and final election results
- **Admin Dashboard**: Complete election administration and monitoring
- **API Documentation**: Swagger UI for exploring API endpoints

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v15+)
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/Secure-Web-Based-Voting-App.git
cd Secure-Web-Based-Voting-App/backend
```

### 2. Set up environment variables

Copy the example environment file and adjust the values as needed:

```bash
cp .env.example .env
```

Important environment variables to set:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `ENCRYPTION_KEY`: 32-byte key for data encryption
- `EMAIL_*`: Email service settings for sending verification emails

### 3. Install dependencies

```bash
npm install
```

### 4. Set up the database

#### Using the setup script (Windows PowerShell)

Run the setup script and follow the prompts:

```powershell
.\setup_database.ps1
```

#### Manual setup

1. Create the PostgreSQL database:

```sql
CREATE DATABASE secure_voting;
CREATE USER voting_user WITH ENCRYPTED PASSWORD 'secure_password_2024!';
GRANT ALL PRIVILEGES ON DATABASE secure_voting TO voting_user;
```

2. Apply the schema:

```bash
npm run migrate
```

3. (Optional) Seed the database with test data:

```bash
npm run seed
```

### 5. Start the development server

```bash
npm run dev
```

The API server will be available at http://localhost:3001 with API documentation at http://localhost:3001/api-docs.

## API Routes

- **Auth**: `/api/auth/*` - User authentication and management
- **Voting**: `/api/voting/*` - Voting operations and ballot access
- **Admin**: `/api/admin/*` - Election and candidate management
- **Results**: `/api/results/*` - Election results and statistics

## Security Features

- CSRF protection
- Rate limiting
- Helmet security headers
- Content Security Policy
- CORS restrictions
- Database query parameterization
- Vote encryption
- Immutable vote ledger
- Comprehensive audit logging

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode during development
npm run test:watch
```

### Docker Support

The backend can be run in Docker:

```bash
# Build the image
docker build -t secure-voting-backend .

# Run the container
docker run -p 3001:3001 --env-file .env secure-voting-backend
```

Or using docker-compose:

```bash
docker-compose up backend
```

## Deployment

For production deployment, ensure you:

1. Set strong `JWT_SECRET` and `ENCRYPTION_KEY` values
2. Configure proper email settings
3. Set up a production-ready PostgreSQL database
4. Deploy behind a reverse proxy (like Nginx) with SSL/TLS
5. Set `NODE_ENV=production`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
