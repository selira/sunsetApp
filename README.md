# Sunset App

This project consists of a Rails API backend and a Vite React frontend.

## Prerequisites

Ensure you have the following installed on your system:

*   **Git:** For cloning the repository.

### For Frontend:
*   **Node.js**
*   **npm** or **yarn**


### For Rails Backend:
*   **Ruby:** (version 3.4.4, recommended to use rbenv or rvm)
*   **Bundler:** (Ruby gem for managing Rails dependencies)
*   **SQLite3**

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sunsetApp
```

### 2. Backend Setup (Rails API)

Navigate to the backend directory:
```bash
cd backend
```

**a. Install Ruby Dependencies:**
```bash
bundle install
```

**b. Setup Database:**
This will create the SQLite database, run migrations, and seed initial data.
```bash
rails db:setup
```

**c. Start the Rails Server:**
By default, runs on `http://localhost:3000`.
```bash
rails server
```
The API backend should now be running.

### 3. Frontend Setup (Vite React App)

Navigate to the frontend directory (from the project root):
```bash
cd vite-front
```

**a. Install Node.js Dependencies:**
Using npm:
```bash
npm install
```

**c. Start the Vite Development Server:**
Using npm:
```bash
npm run dev
```

This will start the frontend app on `http://localhost:5173`.