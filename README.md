# Role-Based Dashboard App

A full-stack, role-based dashboard application built with Next.js App Router and MongoDB, featuring authentication, route protection, and CRUD functionalities.

## Features

- **Authentication**: Email/Password login protected by JWT (HTTP-only cookies).
- **Role-Based Access Control**:
  - **Super Admin**: Can manage Admins and Users.
  - **Admin**: Can manage Users they created.
  - **User**: Can perform CRUD operations on their personal Notes.
- **Middleware Security**: Next.js Edge Middleware protects pages and API routes based on roles.
- **Bonus Implementations**: JWT Auth, Middleware Routing Protection, Tailwind CSS UI.

## Tech Stack

- Next.js (14.2.3, App Router)
- MongoDB with Mongoose
- Tailwind CSS
- `jose` for JWT Edge Runtime compatibility
- `bcryptjs` for password hashing

## Getting Started

### Prerequisites

- Node.js installed
- A running MongoDB instance (local or Atlas)

### Installation

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables. Ensure the `.env.local` file contains:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ebanitech-db
   JWT_SECRET=my-super-secret-jwt-key
   ```

4. Initialize the Super Admin:
   - Run the development server: `npm run dev`
   - Use Postman, cURL, or Thunder Client to make a `POST` request to `http://localhost:3000/api/setup`.
   - This will create the initial Super Admin with:
     - **Email**: `superadmin@example.com`
     - **Password**: `superadmin123`

### Running the application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:3000` in your browser. You will be redirected to the login page.
3. Login using `superadmin@example.com` / `superadmin123`.
4. From the Super Admin dashboard, create an Admin.
5. Logout, login as the Admin, and create a User.
6. Logout, login as the User, and manage your Notes.

## Project Structure

- `src/app/api`: All Next.js route handlers separated by role domains.
- `src/app/dashboard`: Frontend pages grouped by roles, secured dynamically by layout and middleware.
- `src/models`: Mongoose database schemas.
- `src/middleware.ts`: Core security routing enforcing JWT and roles.
# ebanitech-assignment
