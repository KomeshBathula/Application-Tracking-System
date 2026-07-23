# Applicant Tracking System (ATS)

An enterprise-grade, multi-tenant Applicant Tracking System (ATS) featuring hierarchical admin governance, Instagram-style unique username validation, multi-provider AI resume screening (OpenAI, Groq, Anthropic Claude, Google Gemini, DeepSeek), first-time password reset security workflows, scalable server-side paginated user management, and real-time recruiter analytics.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Key Recent Features](#key-recent-features)
- [Architecture](#architecture)
- [Role Model and Privilege Hierarchy](#role-model-and-privilege-hierarchy)
- [API Reference](#api-reference)
- [Database Design](#database-design)
- [Security & Authentication Implementation](#security--authentication-implementation)
- [Multi-Provider AI Resume Screening](#multi-provider-ai-resume-screening)
- [File and Resume Storage](#file-and-resume-storage)
- [Audit Trail & Status Pipeline](#audit-trail--status-pipeline)
- [Exception Handling](#exception-handling)
- [Running Locally](#running-locally)
- [Docker](#docker)

---

## Overview

The platform coordinates job search, application submissions, automated AI screening, and recruitment review workflows across four distinct roles: **Super Admin**, **Company Admin**, **Recruiter**, and **Candidate**.

- **Candidates** register with unique Instagram-style `@usernames`, browse open jobs, manage their profiles, upload resumes, and track real-time application progress.
- **Recruiters** post job listings, review applicant resumes, schedule interviews, and guide candidate applications through structured pipeline status states:
  `APPLIED → REVIEWING → INTERVIEWING → OFFERED → REJECTED` or `WITHDRAWN`.
- **Company Admins** provision and manage company recruiters, oversee company job postings, and configure multi-provider AI screening parameters without cluttering their view with individual interview pipelines.
- **Super Admins** provision Company Admins, inspect global user directories via scalable paginated queries, toggle account access status across all user types (with self-disable protection), and manage system governance policies.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 21 / JavaScript (React 18) |
| Backend Framework | Spring Boot 3.4.1 |
| AI Integration | Spring AI & Multi-Provider Registry (OpenAI, Groq, Claude, Gemini, DeepSeek) |
| Frontend Library | React 18 with Vite |
| Security | Spring Security, JWT (jjwt 0.12.6), BCrypt Password Hashing |
| Persistence | Spring Data JPA, Hibernate, MySQL 8 |
| Styling | Vanilla CSS (Dark mode design, glassmorphism, dynamic tokens) |
| Build Tool | Maven (Backend) / npm & Vite (Frontend) |
| Utilities | Lombok, ModelMapper / MapStruct, Jackson |
| File Uploads | Multi-part Servlet File Storage (Header magic-number anti-spoofing) |
| API Documentation | SpringDoc OpenAPI 3 (Swagger UI) |

---

## Key Recent Features

### 1. Unified & Secured Login Systems
- **Single Portal Authentication**: Unified Candidate and Recruiter sign-in at `/login`. Sign-up is exclusively available for candidates at `/register`.
- **Secured Admin Portals**: Isolated administrative login interfaces for Super Admin (`/super-admin/login`) and Company Admin (`/company-admin/login`).

### 2. Instagram-Style Unique Username Validation
- All users possess a mandatory, unique handle (e.g. `@alex_recruiter`, `@john_dev`).
- Real-time backend API checks verify username availability as the user types during registration and account creation. Non-null unique database schema constraints enforced.

### 3. Strict Password Complexity & Mandatory 1st-Time Reset
- **Password Complexity Rules**: Enforced across all registration, admin creation, recruiter provisioning, and password update endpoints (`>= 8` characters, 1 uppercase letter, 1 number, 1 special character).
- **First-Time Password Reset Flow**: Newly created Company Admins and Recruiters are provisioned with initial default passwords. Upon initial login, a mandatory password update overlay (`ChangePasswordModal.jsx`) forces credentials update before granting dashboard access.

### 4. Admin Privilege Hierarchy & Scalable User Management
- **Super Admin Console**: Dedicated dashboard (`/admin/dashboard`, `/admin/users`, `/admin/roles`, `/admin/settings`).
  - **Company Admin Provisioning**: Create Company Admins and auto-bind or generate company entities.
  - **Scalable Paginated User Directory**: Server-side Spring Data JPA `Pageable` queries with indexed filters (`search`, `role`, `companyId`), capping max page size to 100 records for memory safety.
  - **User Access Management**: Status toggle (`Disable` / `Enable`) enabled across all user types (Candidates, Company Admins, Recruiters, Admins), protected by a self-disabling guard preventing System Admins from disabling their active account.
  - **Governance Control Center**: Interactive governance tabs for Security Policies, SMTP Mail Gateway, Resume Upload Rules, and Database Infrastructure.
- **Company Admin Hub**: Dedicated workspace (`/recruiter/dashboard`, `/recruiter/recruiters`, `/recruiter/jobs`, `/recruiter/ai-config`, `/recruiter/profile`).
  - **Recruiter Provisioning**: Create and manage company recruiters with initial complexity-enforced passwords.
  - **Enterprise Overview**: High-level metrics for team members, company jobs, and AI engine status.

### 5. Multi-Provider AI Resume Screening Engine
- Expanded LLM Provider Registry supporting 5 major AI models:
  - **OpenAI** (`gpt-4o`, `gpt-3.5-turbo`)
  - **Groq** (`llama-3.3-70b-versatile`, `mixtral-8x7b-32768`)
  - **Anthropic Claude** (`claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`)
  - **Google Gemini** (`gemini-1.5-pro`, `gemini-1.5-flash`)
  - **DeepSeek** (`deepseek-chat`, `deepseek-coder`)
- Company Admins can configure AI provider selection, API keys, temperature, max response tokens, and custom resume scoring system prompts.

---

## Architecture

The project follows a decoupled, layered Spring Boot backend architecture and a modular Vite-powered React single page application.

```
Application-Tracking-System/
├── backend/
│   └── src/main/java/com/ats/backend/
│       ├── config/         # Security, CORS, Async, and OpenAPI configuration
│       ├── controller/     # REST Controllers (Admin, CompanyAdmin, Auth, Jobs, Applications, Screening)
│       ├── dto/            # Data Transfer Objects with Bean validation annotations
│       ├── entity/         # JPA Entities mapping MySQL relational schemas
│       ├── exception/      # Global Exception handler mapping custom runtime errors
│       ├── mapper/         # Converters mapping JPA entities to DTOs
│       ├── repository/     # JPA Data repositories with custom JPQL specifications & left joins
│       ├── security/       # JWT Token Provider, JwtAuthenticationFilter
│       └── service/        # Transactional service implementations & AI provider registry
└── frontend/
    └── src/
        ├── components/     # Reusable layout, modal, and navigation elements
        ├── context/        # React context wrappers for auth state & username verification
        ├── pages/          # Candidate, Recruiter, Company Admin, and Super Admin dashboards
        ├── services/       # Interceptor-supported Axios client (401 token clearing & route exemption)
        └── index.css       # Premium dynamic dark theme styling system
```

---

## Role Model and Privilege Hierarchy

Four roles dictate system authorization:

| Role | Access Scope & Capabilities |
|---|---|
| `ROLE_ADMIN` (Super Admin) | Unrestricted global access. Provisions Company Admins, manages scalable paginated user directory across all user types, configures global system settings, and inspects access control matrices. Protected from self-disabling. |
| `ROLE_COMPANY_ADMIN` | Executive enterprise manager. Provisions company recruiters, manages company recruiters (status toggle), oversees company job postings, and configures multi-provider AI screening parameters (OpenAI, Groq, Claude, Gemini, DeepSeek). |
| `ROLE_RECRUITER` | Hiring manager. Creates and edits job postings, reviews candidate applications, updates candidate pipeline statuses, conducts interviews, and views AI resume evaluation reports. |
| `ROLE_CANDIDATE` | Job seeker. Registers with unique Instagram-style `@username`, searches open job listings, uploads resume documents, submits applications, and manages application withdrawals. |

---

## API Reference

### Auth & Credentials — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a candidate (Email, Password, Unique Username) |
| POST | `/login` | Public | Authenticate user — returns JWT token & user metadata |
| GET | `/check-username` | Public | Live check for username handle availability |
| GET | `/me` | Authenticated | Retrieve current user profile details |
| POST | `/change-password` | Authenticated | Mandatory first-time or regular password update |

### Super Admin Governance — `/api/admin`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/company-admins` | Super Admin | Create a new Company Admin & company entity |
| GET | `/users` | Super Admin | Fetch scalable paginated user directory (filters: `search`, `role`, `companyId`) |
| PATCH | `/users/{userId}/status` | Super Admin | Toggle user status (`enabled=true/false`) for any account (self-protected) |

### Company Admin Management — `/api/company-admin`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/recruiters` | Company Admin | Create a recruiter for the admin's company |
| GET | `/recruiters` | Company Admin | Fetch paginated list of recruiters for the company |
| PATCH | `/recruiters/{userId}/status` | Company Admin | Toggle recruiter status (`enabled=true/false`) |
| GET | `/ai-config` | Company Admin | Retrieve active company AI screening configuration |
| POST | `/ai-config` | Company Admin | Save AI provider settings (`OPENAI`, `GROQ`, `CLAUDE`, `GEMINI`, `DEEPSEEK`) |

### Jobs — `/api/jobs`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Recruiter, Admin | Post a new job listing |
| GET | `/` | Authenticated | Query jobs (Paginated, searchable) |
| GET | `/{id}` | Authenticated | Get job details and applicant counts |
| PUT | `/{id}` | Recruiter, Admin | Update job posting details |
| DELETE | `/{id}` | Recruiter, Admin | Delete job listing |

### Applications — `/api/applications`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/apply/{jobId}` | Candidate | Apply to job (Unique check & resume verification) |
| GET | `/me` | Candidate, Admin | List candidate's applications |
| GET | `/job/{jobId}` | Recruiter, Admin | List applications for a job posting |
| PATCH | `/{id}/status` | Recruiter, Admin | Update application status in pipeline |
| POST | `/{id}/withdraw` | Candidate, Admin | Soft-withdraw application |
| GET | `/{id}/timeline` | Authenticated | Get status transition audit timeline |

---

## Database Design

Key MySQL relational schema representation:

```
┌──────────────┐          ┌──────────────┐          ┌────────────────────┐
│    roles     │          │    users     │          │ company_ai_configs │
├──────────────┤1        *├──────────────┤          ├────────────────────┤
│ id           │─────────>│ id           │          │ id                 │
│ role_name    │          │ username (UQ)│         1│ company_id (FK)    │
└──────────────┘          │ email (UQ)   │<─────────│ ai_provider        │
                          │ password     │          │ api_key            │
                          │ full_name    │          │ model_name         │
                          │ pwd_change_req          └────────────────────┘
                          │ company_id   │
                          └──────────────┘
                                 │1
                                 │*
┌──────────────┐          ┌──────────────┐          ┌─────────────────────────────┐
│    jobs      │          │ applications │          │ application_status_history  │
├──────────────┤1        *├──────────────┤1        *├─────────────────────────────┤
│ id           │─────────>│ id           │─────────>│ id                          │
│ title        │          │ candidate_id │          │ application_id              │
│ company      │          │ job_id       │          │ previous_status             │
│ status       │          │ status       │          │ new_status                  │
│ recruiter_id │          │ resume_url   │          │ changed_by_id               │
└──────────────┘          └──────────────┘          └─────────────────────────────┘
```

---

## Security & Authentication Implementation

- **Stateless JWT Security**: Stateless sessions enforced via Spring Security and `JwtAuthenticationFilter`.
- **Sort Property Whitelisting**: Sort keys validated against allowable property sets (`createdAt`, `fullName`, `username`, `email`, `id`) to prevent malicious SQL parameter injection.
- **Pagination Lower-Bound Safeguards**: Rejects negative `page` values and caps max `size` parameters to 100 records.
- **Conflict Exception Handling**: DB `DataIntegrityViolationException` events are caught and translated into HTTP `409 Conflict` responses.

---

## File and Resume Storage

- **Header Magic-Number Verification**: Binary mime-type checking verifies file integrity before storing to disk.
- **Disk Pruning**: Re-uploading a resume automatically prunes previous files to conserve disk storage.
- **Authenticated Binary Streaming**: Resumes are served securely through authenticated controllers.

---

## Running Locally

### Prerequisites
- Java 21 JDK
- Maven 3.x
- Node.js 18+ & npm
- Docker (for MySQL instance)

### 1. Launch MySQL Database
```bash
docker compose up -d
```

### 2. Launch Backend API
```bash
cd backend
./mvnw spring-boot:run
```
*API Server listens on `http://localhost:8080`.*

### 3. Launch Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
*Application opens on `http://localhost:5173`.*
