# Pet Medical Records Tracker

A web application for pet owners to track their pets and their medical records including vaccinations and allergies.

## Features

- **User Authentication**: Secure login system with admin and regular user roles
- **Pet Management**: Add, view, edit, and delete pets
- **Vaccination Records**: Track pet vaccinations with dates
- **Allergy Tracking**: Record pet allergies with severity levels
- **Admin Dashboard**: View all pets and medical records across all users

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Testing**: Jest, React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd metazallia
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```
Edit `.env.local` and update the `AUTH_SECRET` with a secure random string.

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Seed the database with sample data:
```bash
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

The application requires the following environment variables:

- `DATABASE_URL`: SQLite database file path
- `AUTH_SECRET`: Secret key for JWT token encryption (generate a secure random string)
- `NEXTAUTH_URL`: Base URL for the application (for development: http://localhost:3000)

### Default Users

The seed script creates two test users:

- **Admin User**: 
  - Username: `admin`
  - Password: `admin123`
  - Access: Full admin dashboard

- **Regular User**:
  - Username: `john_doe`
  - Password: `user123`
  - Access: Personal pet dashboard

- **Regular User 2**:
  - Username: `jane_doe`
  - Password: `user456`
  - Access: Personal pet dashboard

## Database Schema

### User
- `id`: Unique identifier
- `username`: Unique username
- `firstName`: User's first name
- `lastName`: User's last name
- `password`: Hashed password
- `isAdmin`: Admin role flag
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Pet
- `id`: Unique identifier
- `name`: Pet's name
- `type`: Pet type (Dog, Cat, Bird, etc.)
- `dateOfBirth`: Pet's birth date
- `ownerId`: Reference to User
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Vaccine
- `id`: Unique identifier
- `name`: Vaccine name
- `date`: Vaccination date
- `petId`: Reference to Pet
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Allergy
- `id`: Unique identifier
- `name`: Allergen name
- `reaction`: Reaction description
- `severity`: Severity level (Mild or Severe)
- `petId`: Reference to Pet
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run test`: Run tests
- `npm run test:watch`: Run tests in watch mode
- `npm run db:seed`: Seed database with sample data

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── admin/             # Admin dashboard
│   └── pets/              # Pet management pages
├── components/            # Reusable components
├── lib/                   # Utility libraries
├── types/                 # TypeScript type definitions
└── __tests__/             # Test files
```
