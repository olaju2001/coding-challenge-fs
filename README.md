# Memberspot Technical Challenge

This project implements a paginated list application that fetches and displays Star Wars characters data from the SWAPI API. The project is structured as an Nx monorepo with separate frontend and backend applications, along with shared models.

## Project Structure

memberspot-project/
├── frontend/           # Angular application
├── server/            # NestJS application
├── shared-models/     # Shared models and DTOs
├── package.json
└── nx.json

## Technologies Used

### Frontend
- **Framework**: Angular
- **Styling**: Tailwind CSS
- **State Management**: Angular Services
- **HTTP Client**: Angular HttpClient

### Backend
- **Framework**: NestJS
- **Validation**: Zod
- **Caching**: In-memory caching for API responses

### Shared Models
- **Validation**: Zod schemas
- **Types**: TypeScript interfaces
- **Build System**: Nx

## Main Components

### Frontend Components (/frontend/src/app/)
1. **AppComponent**: Root component that sets up the application layout
2. **PeopleListComponent**: Main component that displays the paginated list of Star Wars characters
   - Implements lazy loading
   - Provides filtering functionality
   - Displays character details including:
     - Name
     - Birth Year
     - Homeworld
     - Homeworld Terrain

### Backend Services (/server/src/)
1. **PeopleService**: Handles data fetching and caching from SWAPI
2. **HomeWorldService**: Manages homeworld data and terrain information
3. **CacheService**: Implements caching strategy for API responses

### Shared Models (/shared-models/)
1. **DTOs**: Data transfer objects for API requests/responses
2. **Interfaces**: TypeScript interfaces for data models
3. **Schemas**: Zod validation schemas

## Running the Project

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Nx CLI (`npm install -g nx`)

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
cd memberspot-project
npm install

Running the Applications
Backend Server

# Start the NestJS server
nx serve server
# or
cd server
npm run start:dev

The server will run on http://localhost:3000
Frontend Application

# Start the Angular application
nx serve frontend
# or
cd frontend
npm run start

# Start the Angular application
nx serve frontend
# or
cd frontend
npm run start

The frontend will be available at http://localhost:4200
### API Endpoints
Backend Routes

GET /api/people: Fetch paginated list of characters
GET /api/people/search: Search characters by name
GET /api/homeworld/:id: Fetch homeworld details

### Features

Case-insensitive filtering of character data
Lazy loading implementation for efficient data fetching
Cached API responses for improved performance
Responsive design with Tailwind CSS
Type-safe data transfer with Zod validation


