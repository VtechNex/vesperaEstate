# Vespera Estates CRM - Backend & Frontend Implementation Guide

## Project Setup Complete ✅

This document outlines all the routes, services, and components that have been implemented to make the application fully operational.

## Backend Routes

### Authentication Routes (`/api/auth`)
- `POST /api/auth/reg` - Register new admin user
- `POST /api/auth/log` - Login user

### User Management Routes (`/api/admin`) - Protected by `requireRole("admin")`
- `POST /api/admin/users` - Create new user
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get specific user by ID
- `PUT /api/admin/users/:id` - Update user details
- `PUT /api/admin/users/deactive/:id` - Deactivate user
- `DELETE /api/admin/users/:id` - Delete user permanently

### Lists Management Routes (`/api/lists`) - Protected by `authMiddleware`
- `POST /api/lists` - Create new list
- `GET /api/lists` - Get all lists for current user
- `GET /api/lists/with-counts` - Get lists with lead counts
- `GET /api/lists/:id` - Get specific list by ID
- `PUT /api/lists/:id` - Update list details
- `DELETE /api/lists/:id` - Delete list

### Leads Management Routes (`/api/leads`) - Protected by `authMiddleware`
- `POST /api/leads` - Create new lead
- `POST /api/leads/search` - Search leads by query
- `GET /api/leads` - Get all leads for all lists
- `GET /api/leads/list/:list_id` - Get leads for specific list
- `GET /api/leads/:id` - Get specific lead by ID
- `PUT /api/leads/:id` - Update lead details
- `DELETE /api/leads/:id` - Delete lead

## Backend Controllers

### User Controller (`src/controllers/admin.user.controller.js`)
- `createUser()` - Create user with username, email, password, and role
- `updateUser()` - Update user information
- `deactiveUser()` - Deactivate user account
- `deleteUser()` - Permanently delete user
- `getUserById()` - Fetch single user
- `getAllUsers()` - Fetch all users

### List Controller (`src/controllers/listController.js`)
- `createList()` - Create new property list
- `getAllLists()` - Get all lists owned by current user
- `getListById()` - Get specific list
- `updateList()` - Update list details
- `deleteList()` - Delete list (will cascade delete leads)
- `getListsWithLeadsCount()` - Get lists with count of leads

### Lead Controller (`src/controllers/leadController.js`)
- `createLead()` - Add new lead to a list
- `getLeadsByListId()` - Get all leads in a list
- `getAllLeads()` - Get all leads for user's lists
- `getLeadById()` - Get specific lead
- `updateLead()` - Update lead information
- `deleteLead()` - Delete lead
- `searchLeads()` - Search leads by name, email, mobile, organization

## Frontend Services

### Auth Service (`src/services/authService.js`)
- `LOGIN()` - Login user (returns token)
- `LOGOUT()` - Clear local storage
- `USER()` - Get current user
- `GET_TOKEN()` - Get decrypted auth token

### Admin Service (`src/services/adminService.js`)
- `CREATE_USER()` - Create new user
- `FETCH_USERS()` - Get all users
- `DELETE_USER()` - Delete user
- `UPDATE_USER()` - Update user
- `DEACTIVE_USER()` - Deactivate user

### List Service (`src/services/listService.js`)
- `CREATE()` - Create new list
- `FETCH_ALL()` - Get all lists
- `FETCH_WITH_COUNTS()` - Get lists with lead counts
- `GET_BY_ID()` - Get specific list
- `UPDATE()` - Update list
- `DELETE()` - Delete list

### Lead Service (`src/services/leadService.js`)
- `CREATE()` - Create new lead
- `FETCH_ALL()` - Get all leads
- `FETCH_BY_LIST()` - Get leads for specific list
- `GET_BY_ID()` - Get specific lead
- `UPDATE()` - Update lead
- `DELETE()` - Delete lead
- `SEARCH()` - Search leads

## Frontend Components

### ManageUsers Component
- Displays all users with filtering by role
- Search functionality for users
- Create new user dialog
- Status indication (Active/Inactive)
- Roles: Admin, Owner, Manager, L1, L2

### ManageList Component
- Displays all lists with lead counts
- Create new list functionality
- Search and sort lists
- Delete lists
- Integration with LISTS service

### ManageLeads Component
- Displays all leads with filtering
- List filter and stage filter
- View modes: All leads / Unattended
- Lead deletion
- Integration with LEADS service

### AddLeads Component
- Multi-field form for adding new leads
- List selection dropdown
- Mobile and email validation
- Contact details entry
- Integration with LEADS service

## Database Schema

### Users Table
```sql
- id (UUID, Primary Key)
- username (unique, case-insensitive)
- email (unique, case-insensitive)
- password (hashed)
- role (admin, owner, manager, l1, l2)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### Lists Table
```sql
- id (BIGSERIAL, Primary Key)
- name (VARCHAR)
- owner_id (UUID, Foreign Key -> users.id)
- subject (VARCHAR)
- description (TEXT)
- created_at (timestamp)
```

### Leads Table
```sql
- id (BIGSERIAL, Primary Key)
- fname (VARCHAR, required)
- lname (VARCHAR)
- designation (VARCHAR)
- organization (VARCHAR)
- email (VARCHAR)
- mobile (VARCHAR, required)
- tel1, tel2 (VARCHAR)
- website (VARCHAR)
- address (TEXT)
- notes (TEXT)
- list_id (BIGINT, Foreign Key -> lists.id)
- created_at (timestamp)
```

## Environment Variables

### Backend (.env)
```
PORT=5000
JWT_SECRET=VESPERA_SECRET_KEY54321
```

### Frontend (.env)
```
VITE_AUTH_API=http://localhost:5000/api/auth
VITE_ADMIN_API=http://localhost:5000/api/admin
VITE_LISTS_API=http://localhost:5000/api/lists
VITE_LEADS_API=http://localhost:5000/api/leads
VITE_SECRET_KEY=Vespera_Estate_12345
```

## Running the Application

### Backend
```bash
cd backend
npm install
npm run dev  # Runs on port 5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Runs on port 5173
```

## Authentication Flow

1. User registers/logs in via `/api/auth/reg` or `/api/auth/log`
2. Backend returns JWT token
3. Frontend encrypts and stores token in localStorage
4. Token is included in `Authorization: Bearer <token>` header for all protected routes
5. Backend validates token via `authMiddleware`
6. Role-based access control via `requireRole()` middleware

## Key Features Implemented

✅ User Authentication & Management
✅ List Management (Create, Read, Update, Delete)
✅ Lead Management (Create, Read, Update, Delete, Search)
✅ Role-based Access Control (Admin, Owner, Manager, L1, L2)
✅ Database with PostgreSQL (Neon)
✅ Frontend-Backend API Integration
✅ Token-based Authentication with JWT
✅ Encrypted Token Storage
✅ Responsive UI with Tailwind CSS
✅ Error Handling & Validation

## Next Steps

1. Test all API endpoints using Postman or similar tool
2. Verify frontend components can fetch and display data
3. Test user authentication flow
4. Verify list and lead CRUD operations
5. Test search functionality
6. Check role-based access control
7. Monitor console for any errors
