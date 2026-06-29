# Application Tracking System

A portal-based Applicant Tracking System (ATS) featuring separate user entry-points, role-guarded routing, and a dark/light theme switcher. 

Built using Spring Boot 3.x (Java 21) on the backend and React (Vite) on the frontend.

---

## Architecture & How It Works

The application utilizes a classic layered architecture, ensuring separation of concerns:

```
[ Frontend: React / Vite ]
            │ (Axios API Requests with JWT)
            ▼
[ Controller (JobController / AuthController) ]
            │ (DTO Transfer)
            ▼
[ Service Layer (JobServiceImpl / AuthServiceImpl) ]
            │ (Business & Authorization Checks)
            ▼
[ Repository Layer (JobRepository / UserRepository) ]
            │ (Spring Data JPA / JPQL Query Specifications)
            ▼
[ Database: MySQL (Docker Container) ]
```

### 1. Authentication Flow & Role Guards
* **Authentication**: Users authenticate using `/api/auth/login`. The server verifies credentials and responds with a JWT token containing role credentials.
* **Axios Interceptor**: The frontend stores this token and automatically attaches it to the `Authorization: Bearer <token>` header of every API request.
* **Token Expiration Handler**: If a request returns a `401 Unauthorized` status (e.g. token expired), the interceptor automatically logs out the user and redirects them to their respective portal's login form.
* **Protected Routes**: React Router checks user context roles. If a candidate attempts to manually visit `/recruiter/dashboard`, they are redirected to `/unauthorized`.

### 2. Job Search, Pagination, and Validation
* **Backend Searching & Pagination**: Searching, sorting, and pagination are handled efficiently at the database level. The `JobRepository` uses JPQL to execute queries based on user parameters, returning a paginated `Page<JobDto>` model.
* **Candidate Scope Limit**: For security, when a user with a `ROLE_CANDIDATE` calls the GET `/api/jobs` endpoint, the controller overrides the query filter status to `OPEN` to prevent them from viewing closed jobs.
* **Lombok & Bean Validation**: The DTO payloads utilize standard annotations (`@NotBlank`, `@NotNull`, etc.) to enforce schema validity before reaching the service layer.

---

## Folder Structure

```
Application-Tracking-System/
├── backend/
│   └── src/main/java/com/ats/backend/
│       ├── config/                 # Security, CORS, and general configurations
│       ├── controller/             # REST endpoints (Auth, User roles, Jobs)
│       ├── dto/                    # Unified request/response validation mappings
│       ├── entity/                 # JPA models (User, Role, Job, status enums)
│       ├── exception/              # Global handler & custom exceptions (JobNotFound)
│       ├── mapper/                 # Entity-to-DTO translators
│       ├── repository/             # Database access interfaces
│       ├── security/               # JWT token filter & authorization filters
│       └── service/                # Business logic implementations
├── frontend/
│   └── src/
│       ├── components/             # Reusable UI cards, lists, search, and forms
│       ├── context/                # Theme context & Auth context states
│       ├── pages/                  # Portal-specific landing pages and dashboards
│       ├── services/               # Axios client and token interceptors
│       ├── App.jsx                 # Routing configuration and protected routes
│       └── index.css               # Clean typography, layout rules, and variables
└── docker-compose.yml              # Standard MySQL database environment
```

---

## Getting Started

### 1. Database (Docker)
The backend requires a MySQL database. You can start it up using the provided compose file:
```bash
docker compose up -d
```

### 2. Backend Server
Navigate to the `backend` directory, install dependencies, and run the Spring Boot application:
```bash
cd backend
mvn spring-boot:run
```
*The server will run on `http://localhost:8080`.*

### 3. Frontend Web App
Navigate to the `frontend` directory, install packages, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
*The UI will run on `http://localhost:5173`.*

### Default Logins for Testing
- **Admin**: `admin@ats.com` / `admin123`
- **Recruiter**: `recruiter@ats.com` / `recruiter123`
- **Candidate**: `candidate@ats.com` / `candidate123`
