# Secure Web-Based Voting App Frontend

This is the frontend component of the Secure Web-Based Voting App, providing a user interface for voters and administrators to interact with the voting system.

## Features

- **User Authentication**: Secure login/registration with MFA support
- **Voting Interface**: Intuitive voting experience for users
- **Results Visualization**: Real-time and final election results
- **Admin Dashboard**: Complete election management interface
- **Responsive Design**: Works on desktop and mobile devices
- **Profile Management**: User account settings and security features

## Tech Stack

- **React**: Frontend library for building user interfaces
- **React Router**: For navigation and routing
- **Material UI**: Component library for consistent design
- **React Query**: Data fetching and state management
- **Axios**: HTTP client for API requests
- **Yup**: Form validation
- **React Hook Form**: Form state management
- **Recharts**: Data visualization for election results
- **React Hot Toast**: Toast notifications
- **CryptoJS**: Client-side encryption utilities

## Prerequisites

- Node.js (v14+)
- npm or yarn
- Backend API running (default: http://localhost:3001/api)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/Secure-Web-Based-Voting-App.git
cd Secure-Web-Based-Voting-App/frontend
```

### 2. Set up environment variables

Create a `.env` file in the frontend directory:

```bash
VITE_API_URL=http://localhost:3001/api
```

Adjust the API URL if your backend is hosted elsewhere.

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at http://localhost:3000.

### 5. Automated setup (Windows PowerShell)

Alternatively, run the setup script:

```powershell
.\setup.ps1
```

## Project Structure

```
frontend/
├── public/             # Public assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── pages/          # Main application pages
│   ├── services/       # API services
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # Entry point
│   └── theme.js        # Material UI theme configuration
├── .env                # Environment variables
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
└── vite.config.js      # Vite configuration
```

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run preview`: Preview the production build locally
- `npm run lint`: Run the linter
- `npm run lint:fix`: Fix linting issues

## User Roles

1. **Voter**
   - Register and authenticate
   - Cast votes in available elections
   - View election results
   - Manage profile settings

2. **Admin**
   - All voter capabilities
   - Access to admin dashboard
   - Manage candidates and elections
   - View detailed voting statistics
   - Access audit logs

## Development

### Code Style

This project uses ESLint for code linting. Run `npm run lint` to check for issues.

### Building for Production

```bash
npm run build
```

This will create a `dist` directory with the production-ready build.

### Docker Support

The frontend can be built and run in a Docker container:

```bash
# Build the image
docker build -t secure-voting-frontend .

# Run the container
docker run -p 3000:3000 secure-voting-frontend
```

Or using docker-compose:

```bash
docker-compose up frontend
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
