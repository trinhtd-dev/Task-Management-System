# Task-Management-System

## Introduction

This is a RESTful API built with Node.js, Express, TypeScript, and MongoDB. It provides a comprehensive solution for managing tasks, allowing users to create, read, update, and delete tasks, as well as manage task statuses and participants.

## Features

- **User Authentication**: Secure API endpoints with token-based authentication
- **Task Management**: Create, read, update, and delete tasks
- **Status Tracking**: Update and track task statuses
- **Bulk Operations**: Update multiple tasks at once
- **Participant Management**: Assign tasks to multiple participants
- **Hierarchical Tasks**: Support for parent-child task relationships

## Technologies Used

- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: Custom token-based authentication
- **Deployment**: Vercel

## API Endpoints

### User Endpoints

- `POST /api/v1/user/register`: Register a new user
- `POST /api/v1/user/login`: Login and get authentication token
- `GET /api/v1/user/profile`: Get current user profile
- `PATCH /api/v1/user/update`: Update user profile

### Task Endpoints

- `GET /api/v1/task`: Get all tasks
- `GET /api/v1/task/detail/:id`: Get task by ID
- `POST /api/v1/task/create`: Create a new task
- `PATCH /api/v1/task/update/:id`: Update a task
- `DELETE /api/v1/task/delete/:id`: Delete a task (soft delete)
- `PATCH /api/v1/task/update-status/:id`: Update task status
- `PATCH /api/v1/task/update-multiple`: Update multiple tasks at once

## System Requirements

- Node.js (version 14.x or higher)
- MongoDB
- npm or yarn

## Installation and Setup

### Install Dependencies

```bash
# Clone the repository
git clone https://github.com/trinhtd-dev/Task-Management-System

# Navigate to the project directory
cd task-management-ts

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the root directory with the following content:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/task-management
```

### Development

```bash
# Run the application in development mode
npm run dev
```

### Production Build

```bash
# Build the TypeScript code
npm run build

# Start the production server
npm start
```

## Project Structure

```
task-management-ts/
├── api/
│   └── v1/
│       ├── controllers/    # Request handlers
│       ├── models/         # Mongoose models
│       └── routes/         # API routes
├── config/                 # Configuration files
├── middleware/             # Express middlewares
├── helpers/                # Utility functions
├── .env                    # Environment variables
├── index.ts                # Application entry point
├── package.json            # Project dependencies
└── tsconfig.json           # TypeScript configuration
```

## Authentication

The API uses token-based authentication. Include the token in the Authorization header for protected routes:

```
Authorization: Bearer YOUR_TOKEN
```

## Error Handling

The API returns consistent error responses with the following format:

```json
{
  "code": 400,
  "message": "Error message"
}
```

## Deployment

The application is configured for deployment on Vercel with the included `vercel.json` configuration file.

## Contact

If you have any questions or suggestions, please contact via email: tranductrinh2k4@gmail.com
