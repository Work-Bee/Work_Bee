# MERN Stack Job Portal

A comprehensive job portal application for unskilled jobs built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🌟 Features

### For Job Seekers
- **User Registration & Authentication** - Secure JWT-based authentication
- **Profile Management** - Complete profile with skills, experience, and resume upload
- **Job Search & Filtering** - Advanced search by location, category, salary, etc.
- **Job Applications** - Easy one-click application with resume attachment
- **Application Tracking** - Track application status and history
- **Responsive Design** - Mobile-friendly interface

### For Employers
- **Company Profile Management** - Complete company information and branding
- **Job Posting & Management** - Create, edit, and manage job listings
- **Application Review** - Review applications with candidate details
- **Application Status Management** - Update application status and add notes
- **Dashboard Analytics** - Overview of jobs and applications

### General Features
- **Role-based Access Control** - Different interfaces for job seekers and employers
- **File Upload Support** - Resume upload with validation
- **Email Notifications** - Status updates and confirmations
- **Search & Filter** - Comprehensive job search capabilities
- **Mobile Responsive** - Works seamlessly on all devices

## 🏗️ Project Structure

```
mern-WorkBee/
├── backend/                 # Node.js/Express API Server
│   ├── controllers/         # Route controllers
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   └── companyController.js
│   ├── models/             # MongoDB Mongoose models
│   │   ├── User.js
│   │   ├── Company.js
│   │   ├── Job.js
│   │   └── Application.js
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   ├── applications.js
│   │   ├── companies.js
│   │   └── users.js
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── upload.js
│   ├── config/             # Configuration files
│   │   └── db.js
│   ├── scripts/            # Utility scripts
│   │   └── seed.js
│   ├── uploads/            # File uploads directory
│   └── server.js           # Express server entry point
├── frontend/               # React 18 Application
│   ├── public/             # Public assets
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── Layout.js
│   │   │   ├── LoadingSpinner.js
│   │   │   └── ProtectedRoute.js
│   │   ├── pages/          # Page components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Jobs.js
│   │   │   ├── JobDetails.js
│   │   │   ├── Profile.js
│   │   │   ├── Applications.js
│   │   │   └── EmployerDashboard.js
│   │   ├── context/        # React Context API
│   │   │   └── AuthContext.js
│   │   ├── utils/          # Utility functions
│   │   │   └── api.js
│   │   ├── App.js          # Main App component
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Tailwind CSS styles
│   ├── tailwind.config.js  # Tailwind configuration
│   ├── postcss.config.js   # PostCSS configuration
│   └── package.json
├── package.json            # Root package.json
├── .gitignore
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mern-WorkBee
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install-all
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/WorkBee
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/WorkBee

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d
```

### 4. Database Setup

#### Option A: Seed with Demo Data (Recommended)
```bash
# Navigate to backend directory
cd backend

# Run the seed script to populate with demo data
npm run seed
```

#### Option B: Start with Empty Database
Just ensure your MongoDB is running and the connection string is correct.

### 5. Start the Application

#### Development Mode (Recommended)
```bash
# From the root directory, start both backend and frontend
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend React app on http://localhost:3000

#### Production Mode
```bash
# Start backend only
npm run server

# In another terminal, start frontend
npm run client
```

## 🎯 Demo Accounts

After running the seed script, you can use these demo accounts:

### Job Seeker Account
- **Email:** jobseeker@demo.com
- **Password:** demo123

### Employer Account
- **Email:** employer@demo.com
- **Password:** demo123

## 🔧 Technologies Used

### Backend Stack
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **multer** - File upload middleware
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **helmet** - Security middleware
- **express-rate-limit** - Rate limiting

### Frontend Stack
- **React 18** - JavaScript library for UI
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form library
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **React Context API** - State management

### Development Tools
- **Nodemon** - Development server auto-restart
- **Concurrently** - Run multiple commands
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/profile     # Get current user profile
PUT  /api/auth/profile     # Update user profile
PUT  /api/auth/change-password # Change password
PUT  /api/auth/deactivate  # Deactivate account
```

### Job Endpoints
```
GET    /api/jobs           # Get all jobs (with search/filter)
GET    /api/jobs/featured  # Get featured jobs
GET    /api/jobs/:id       # Get single job
POST   /api/jobs           # Create new job (Employer only)
PUT    /api/jobs/:id       # Update job (Employer only)
DELETE /api/jobs/:id       # Delete job (Employer only)
GET    /api/jobs/employer/my-jobs # Get employer's jobs
PUT    /api/jobs/:id/toggle-status # Toggle job active status
```

### Application Endpoints
```
POST   /api/applications                    # Apply for job
GET    /api/applications/my-applications    # Get user's applications
GET    /api/applications/employer/:jobId    # Get job applications (Employer)
GET    /api/applications/employer/all       # Get all employer applications
GET    /api/applications/:id               # Get single application
PUT    /api/applications/:id/status        # Update application status
PUT    /api/applications/:id/notes         # Add employer notes
DELETE /api/applications/:id               # Withdraw application
```

### Company Endpoints
```
GET  /api/companies              # Get all companies
GET  /api/companies/:id          # Get single company
GET  /api/companies/profile/my-company # Get employer's company
POST /api/companies              # Create company (Employer only)
PUT  /api/companies/:id          # Update company (Employer only)
```

### File Upload Endpoints
```
POST /api/users/upload-resume    # Upload resume to profile
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Server-side validation for all inputs
- **File Upload Security** - File type and size restrictions
- **Rate Limiting** - Prevents abuse and brute force attacks
- **CORS Configuration** - Controlled cross-origin requests
- **Helmet.js** - Security headers
- **Role-based Access Control** - Different permissions for different user types

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- **Desktop** - Full-featured experience
- **Tablet** - Adapted layouts and touch-friendly interfaces
- **Mobile** - Streamlined mobile experience with touch navigation

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional interface
- **Intuitive Navigation** - Easy-to-use navigation structure
- **Loading States** - Smooth loading experiences
- **Error Handling** - User-friendly error messages
- **Form Validation** - Real-time form validation
- **Accessibility** - WCAG compliant design elements

## 🚦 Development Workflow

### Code Structure
- **MVC Pattern** - Organized code structure
- **Modular Components** - Reusable React components
- **Custom Hooks** - Shared logic in custom hooks
- **Context API** - Global state management
- **Environment Configuration** - Separate dev/prod configs

### Best Practices
- **Error Boundaries** - Graceful error handling
- **Loading States** - User feedback during async operations
- **Form Validation** - Client and server-side validation
- **Security Headers** - Comprehensive security setup
- **Code Comments** - Well-documented codebase

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure mobile responsiveness
- Test across different browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support, email support@WorkBee.com or create an issue on GitHub.

## 🚀 Deployment

### Heroku Deployment
1. Create a Heroku app
2. Set environment variables
3. Connect to GitHub repository
4. Enable automatic deployments

### Netlify (Frontend) + Heroku (Backend)
1. Deploy backend to Heroku
2. Update API_URL in frontend
3. Deploy frontend to Netlify

### Docker Deployment
Docker configuration files can be added for containerized deployment.

---

**Built with ❤️ using the MERN Stack**# Work_Bee
