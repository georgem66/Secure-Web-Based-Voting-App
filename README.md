# Secure Web-Based Voting Application

A secure web-based voting application that ensures reliability, usability, and integrity of electronic voting processes.

## What it Does

The Secure Web-Based Voting Application is a digital voting solution that:

- Provides a secure platform for conducting electronic elections
- Manages voter registration and verification
- Facilitates candidate creation and election setup
- Handles the voting process with encryption and verification
- Calculates and displays election results in real-time
- Maintains a tamper-proof record of all votes
- Offers separate interfaces for voters and administrators

## Benefits of Using It

- **Enhanced Security**: End-to-end encryption and blockchain-inspired ledger ensure vote integrity
- **Accessibility**: Web-based platform allows voting from any device with internet access
- **Transparency**: Real-time results and vote verification increase trust in the process
- **Efficiency**: Eliminates paper ballots and manual counting, reducing costs and errors
- **Auditability**: Comprehensive logging creates a verifiable trail of all actions
- **User Experience**: Intuitive interface makes voting simple and accessible
- **Scalability**: Handles elections of any size from small organizations to large constituencies

## How to Use It

### Installation

#### With Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/georgem66/Secure-Web-Based-Voting-App.git
   cd Secure-Web-Based-Voting-App
   ```

2. **Set environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Initialize the database:**
   ```bash
   docker-compose exec backend npm run seed
   ```

5. **Access the application:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API Documentation: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

#### Without Docker

1. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Configure environment files:**
   ```bash
   # In the backend directory
   cp .env.example .env
   
   # In the frontend directory
   cp .env.example .env
   ```

3. **Set up database and start servers:**
   ```bash
   # Backend
   cd backend
   npm run migrate
   npm run seed
   npm run dev
   
   # Frontend (in a new terminal)
   cd frontend
   npm run dev
   ```

### Using the Application

#### For Voters

1. **Register an Account:**
   - Visit the registration page
   - Provide your information and verify your email

2. **Login:**
   - Use your email and password
   - Complete any required verification steps

3. **Cast Your Vote:**
   - Browse the list of candidates
   - Select your preferred candidate
   - Review and confirm your selection
   - Keep your vote receipt (transaction hash) for verification

4. **View Results:**
   - Check election results in real-time
   - Verify your vote was recorded correctly using your receipt

#### For Administrators

1. **Access Admin Dashboard:**
   - Log in with administrative credentials
   - Navigate to the admin dashboard

2. **Manage Elections:**
   - Create and configure new elections
   - Add candidates with descriptions and photos
   - Set election parameters and timeframes

3. **Monitor Voting:**
   - View real-time statistics
   - Access comprehensive audit logs
   - Generate reports on voting activity

### Key Features

1. **Voter Features:**
   - Secure account management
   - Simple and accessible voting interface
   - Vote verification system
   - Real-time results viewing
   - Multi-factor authentication

2. **Administrator Features:**
   - Complete election management
   - Candidate registration system
   - User verification and management
   - Real-time statistics and reporting
   - Comprehensive audit trail access

3. **Security Features:**
   - End-to-end encryption of votes
   - Blockchain-inspired immutable vote ledger
   - Advanced protection against common web attacks
   - Multi-layered authentication system
   - Comprehensive logging and monitoring

### Technical Information

- Built with Node.js/Express (backend) and React/Material UI (frontend)
- Uses PostgreSQL for secure data storage
- Implements JWT authentication with refresh tokens
- Containerized with Docker for easy deployment
- API documentation available at `/api-docs` endpoint
- Features responsive design for mobile and desktop use