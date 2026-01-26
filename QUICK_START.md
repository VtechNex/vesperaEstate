# Quick Start & Testing Guide

## Setup Instructions

### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

Server will run on `http://localhost:5000`

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## Database Setup

The application uses PostgreSQL (Neon database). Connection details are already configured in:
- File: `backend/src/db/pool.js`

The database schema is defined in `backend/db.sql`. Make sure the following tables exist:
- `users`
- `lists`
- `leads`

## Testing the Application

### 1. Authentication Flow
1. Go to http://localhost:5173
2. Register a new admin user or login
3. Token will be encrypted and stored in localStorage

### 2. User Management
1. Navigate to Admin Dashboard
2. Go to "Manage Users" section
3. Test:
   - ✅ Create new user (fill form and submit)
   - ✅ View all users list
   - ✅ Filter users by role
   - ✅ Search users by username/email

### 3. Lists Management
1. Navigate to Admin Dashboard
2. Go to "Manage Lists" section
3. Test:
   - ✅ Create new property list
   - ✅ View all lists with lead counts
   - ✅ Search and sort lists
   - ✅ Delete lists

### 4. Leads Management
1. Navigate to Admin Dashboard
2. Go to "Add Leads" section
3. Test:
   - ✅ Create new lead (select list, fill form, submit)
   - ✅ View all leads in "Manage Leads"
   - ✅ Filter leads by list and stage
   - ✅ Search leads
   - ✅ Delete leads

## API Endpoints Testing (using Postman or cURL)

### Register User
```bash
POST http://localhost:5000/api/auth/reg
Content-Type: application/json

{
  "username": "admin1",
  "email": "admin@example.com",
  "password": "Password123"
}
```

### Login
```bash
POST http://localhost:5000/api/auth/log
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Password123"
}

# Response includes token - save for next requests
```

### Create User (Admin only)
```bash
POST http://localhost:5000/api/admin/users
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "username": "manager1",
  "email": "manager@example.com",
  "password": "Password123",
  "role": "manager"
}
```

### Get All Users
```bash
GET http://localhost:5000/api/admin/users
Authorization: Bearer YOUR_TOKEN_HERE
```

### Create List
```bash
POST http://localhost:5000/api/lists
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "name": "RENT - REQUIREMENT",
  "subject": "Rent Properties",
  "description": "List of rental properties"
}
```

### Get All Lists
```bash
GET http://localhost:5000/api/lists/with-counts
Authorization: Bearer YOUR_TOKEN_HERE
```

### Create Lead
```bash
POST http://localhost:5000/api/leads
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "fname": "John",
  "lname": "Doe",
  "email": "john@example.com",
  "mobile": "+91-9876543210",
  "list_id": 1,
  "designation": "Manager",
  "organization": "ABC Corp",
  "website": "https://example.com",
  "address": "123 Main St, City",
  "notes": "Interested in 2BHK apartment"
}
```

### Get All Leads
```bash
GET http://localhost:5000/api/leads
Authorization: Bearer YOUR_TOKEN_HERE
```

### Search Leads
```bash
POST http://localhost:5000/api/leads/search
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "query": "John"
}
```

## Common Issues & Solutions

### Issue: Port 5000 already in use
```bash
# Kill the process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Issue: Database connection failed
- Check PostgreSQL credentials in `backend/src/db/pool.js`
- Verify Neon database is accessible
- Check internet connection

### Issue: CORS errors
- Frontend and backend URLs must match in `.env` files
- Check that CORS is properly configured in `backend/src/server.js`

### Issue: Token errors
- Clear browser localStorage and login again
- Check that JWT_SECRET is set in backend `.env`
- Verify token is being sent in Authorization header

## Project Structure

```
vesperaEstate/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── admin.user.controller.js
│   │   │   ├── listController.js
│   │   │   └── leadController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── admin.user.routes.js
│   │   │   ├── lists.js
│   │   │   └── leads.js
│   │   ├── middleware/
│   │   │   └── security.js
│   │   ├── db/
│   │   │   └── pool.js
│   │   └── server.js
│   ├── db.sql
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── services/
    │   │   ├── authService.js
    │   │   ├── adminService.js
    │   │   ├── listService.js
    │   │   └── leadService.js
    │   ├── pages/
    │   │   └── dashboards/
    │   │       ├── Admin.jsx
    │   │       └── components/
    │   │           ├── ManageUsers.jsx
    │   │           ├── ManageList.jsx
    │   │           ├── ManageLeads.jsx
    │   │           └── AddLeads.jsx
    │   ├── utils/
    │   │   └── utils.js
    │   └── App.jsx
    ├── package.json
    └── .env
```

## Features Implemented

### Backend
- ✅ JWT Authentication with token encryption
- ✅ Role-based access control (Admin, Owner, Manager, L1, L2)
- ✅ User CRUD operations
- ✅ List CRUD operations with lead counts
- ✅ Lead CRUD operations with search
- ✅ Database validation and error handling
- ✅ CORS configuration for frontend integration

### Frontend
- ✅ Responsive UI with Tailwind CSS
- ✅ Authentication flows (login/register)
- ✅ User management interface
- ✅ List management interface
- ✅ Lead management and creation
- ✅ Search and filter capabilities
- ✅ Token-based API integration
- ✅ Error handling and user feedback

## Next Steps

1. Test all endpoints with Postman
2. Verify data flows between frontend and backend
3. Test user role-based access
4. Add additional validations as needed
5. Set up database migrations
6. Deploy to production environment

## Support

For issues or questions:
1. Check console for error messages
2. Review IMPLEMENTATION_GUIDE.md for detailed API documentation
3. Verify .env files have correct values
4. Check database connection and tables exist
