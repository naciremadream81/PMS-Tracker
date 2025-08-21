## Permit Package Manager - Backend (Server)

### Table of Contents
- **Overview**
- **Architecture**
  - Runtime, Frameworks, Libraries
  - Directory Structure
  - Data Models and Associations
  - Middleware and Security
- **Setup and Configuration**
  - Prerequisites
  - Environment Variables
  - Install and Run
  - Database and Seeding
- **API Endpoints**
  - Auth
  - Admin
  - Counties
  - Checklists
  - Files
  - Health
- **Usage Examples**
- **Best Practices and Pitfalls**
- **Security Notes**
- **Changelog of Recent Fixes**
- **FAQ**

---

## Overview
The backend is a Node.js/Express service for the Permit Package Manager application. It provides APIs to authenticate users, manage administrative data (users, counties, checklists), handle permit artifacts and file uploads, and deliver metadata to the client UI.

The server uses Sequelize with PostgreSQL for persistence, JSON Web Tokens for authentication, and includes production-ready middleware such as Helmet, CORS, rate limiting, and structured logging.

---

## Architecture

### Runtime, Frameworks, Libraries
- **Node.js** with **Express** for the HTTP server
- **Sequelize** ORM with **PostgreSQL**
- **JWT** for stateless authentication
- **Helmet**, **CORS**, **express-rate-limit**, **morgan** for security and observability
- **multer** for file uploads

### Directory Structure
```
server/
  index.js               # Server bootstrap: middleware, routes, start
  config/                # Environment/config helpers (if any)
  middleware/            # Authentication and other middlewares
  models/                # Sequelize models and associations
  routes/                # Express route modules (auth, admin, files, ...)
  scripts/               # DB seed and utility scripts
  uploads/               # Local upload target (for development)
  package.json
  Dockerfile
```

### Data Models and Associations
Defined in `models/index.js` with the following primary entities:
- **User**: authentication, profile, role (`user` or `admin`)
- **County**: jurisdiction metadata
- **Checklist**: permit checklist entries (by county, project type, category)
- **Permit**: a project/permit owned by a user
- **PermitFile**: file metadata associated with a permit
- **PermitChecklist**: join table linking `Permit` and `Checklist`

Key associations:
- `User hasMany Permit`
- `County hasMany Checklist`
- `County hasMany Permit`
- `Permit hasMany PermitFile`
- `Permit belongsToMany Checklist` through `PermitChecklist` (and vice versa)

### Middleware and Security
Configured in `index.js`:
- `helmet()` for secure headers
- `cors({ origin: CLIENT_URL, credentials: true })`
- `express-rate-limit` on `/api/`
- `morgan('combined')` logging
- `express.json` and `express.urlencoded` with size limits

Auth middlewares in `middleware/auth.js`:
- `auth`: verifies JWT, loads active user to `req.user`
- `adminAuth`: delegates to `auth` and then enforces `req.user.role === 'admin'`

---

## Setup and Configuration

### Prerequisites
- Node.js 18+
- PostgreSQL 13+

### Environment Variables
Create `server/.env` based on `server/env.example`:
- `DATABASE_URL` (e.g., `postgresql://user:pass@localhost:5432/permit_manager`)
- `JWT_SECRET` (required in non-development; never use defaults in production)
- `CLIENT_URL` (e.g., `http://localhost:3000`)
- `PORT` (default 5000)
- `NODE_ENV` (`development` | `production`)

### Install and Run
```
cd server
npm ci
npm run dev   # development with nodemon
# or
npm start     # production
```

### Database and Seeding
- On startup in development, the server will `sequelize.sync({ alter: true })` to keep schema up-to-date.
- Seed data helpers:
  - `npm run seed`
  - `npm run seed-florida`
  - `npm run seed-all`
  - `npm run create-admin`
  - `npm run create-demo`

---

## API Endpoints

### Auth (`/api/auth`)
- `POST /register` – create user; returns `token` and `user`
- `POST /login` – authenticate; returns `token` and `user`
- `GET /profile` – get current user (requires `Authorization: Bearer <token>`)
- `PUT /profile` – update profile fields (first/last name, company, phone)
- `PUT /change-password` – change password with `currentPassword` and `newPassword`

### Admin (`/api/admin`) – requires admin role
- `GET /users` – list users with pagination and filters
- `GET /users/:id` – user detail with permits
- `POST /users` – create a user (including role and isActive)
- `PUT /users/:id` – update a user (cannot deactivate yourself)
- `DELETE /users/:id` – delete a user (cannot delete yourself; blocked if user has permits)

### Counties (`/api/counties`)
- `GET /` – list counties (filter by `state`, `isActive`)
- `GET /state/:state` – list active counties in a state (2-letter code)
- `GET /states/all` – list all unique states available
- `GET /:id` – county detail with active checklists

### Checklists (`/api/checklists`)
- `GET /` – list with filters: `countyId`, `projectType`, `category`, `isActive`
- `GET /county/:countyId` – active checklists for county
- `GET /project-type/:projectType` – optional `countyId` query
- `GET /:id` – checklist detail
- `GET /categories/summary` – aggregates by category for optional filters

### Files (`/api/files`) – requires auth
- `POST /upload/:permitId` – multipart upload field `file` with optional metadata
- `GET /permit/:permitId` – list files for a permit
- `GET /download/:fileId` – download a file the user owns
- `PUT /:fileId` – update file metadata (description, fileType, isRequired)
- `DELETE /:fileId` – delete a file the user owns

### Health
- `GET /health` – service status and timestamp

---

## Usage Examples

### 1) Register and Login
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email":"alice@example.com",
    "password":"Str0ngPass!",
    "firstName":"Alice","lastName":"Doe"
  }'

curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"Str0ngPass!"}'
```

### 2) Authenticated Profile
```bash
TOKEN=... # from login
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/auth/profile
```

### 3) Admin: List Users
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  'http://localhost:5000/api/admin/users?page=1&limit=20&isActive=true'
```

### 4) Upload a File to a Permit
```bash
curl -X POST http://localhost:5000/api/files/upload/<PERMIT_ID> \
  -H "Authorization: Bearer $TOKEN" \
  -F file=@./example.pdf \
  -F description='Site plan' -F fileType=document -F isRequired=true
```

---

## Best Practices and Pitfalls
- **Set `JWT_SECRET` in all non-dev environments**. Never rely on defaults.
- **Password hashing is enforced** via Sequelize hooks; do not bypass with raw SQL updates.
- **Do not reorder counties routes**: ensure static routes (`/state/:state`, `/states/all`) are defined before `/:id`.
- **Uploads**: The default storage saves to `server/uploads`. In production, prefer object storage (S3/GCS). Ensure `fileSize` limits and MIME allowlist suit your needs.
- **Rate limits**: Default is 100 requests/15 min on `/api/`. Tune for your deployment.
- **Error handling**: Central error handler obscures messages unless `NODE_ENV=development`.

---

## Security Notes
- JWT tokens are required for protected routes. Inactive users are blocked.
- Admin-only routes use `adminAuth` that chains after `auth` and checks `role`.
- Uploaded files are stored outside the web root by default and downloaded via a controlled endpoint with ownership checks.

---

## Changelog of Recent Fixes

### 1) Passwords were not hashed on create/update
Impact: Risk of storing plaintext passwords and failing login checks when `bcrypt.compare` is used against plaintext.

Fix: Added Sequelize hooks to hash on create and when `password` changes.
```60:88:server/models/User.js
// Hooks for secure password storage
User.addHook('beforeCreate', async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.addHook('beforeUpdate', async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});
```

### 2) Admin auth could double-handle responses and bypass role check
Impact: The previous pattern `await auth(req, res, () => {})` risked double responses and skipped error propagation.

Fix: Chain `auth` properly and only proceed when a valid `req.user` exists.
```32:46:server/middleware/auth.js
const adminAuth = (req, res, next) => {
  // Delegate to auth middleware and continue only on success
  auth(req, res, (err) => {
    if (err) return next(err);
    // If auth handled the response (e.g., 401), do not continue
    if (!req.user) return;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
  });
};
```

### 3) Route shadowing in counties
Impact: `GET /api/counties/:id` defined before static routes could match `state` and `states/all` paths accidentally.

Fix: Define static routes first, then `/:id`.
```40:106:server/routes/counties.js
// Get counties by state
router.get('/state/:state', async (req, res) => { /* ... */ });

// Get all states
router.get('/states/all', async (req, res) => { /* ... */ });

// Get single county by ID with checklists
router.get('/:id', async (req, res) => { /* ... */ });
```

---

## FAQ
- **Why do I get 401 Unauthorized?** Ensure you send `Authorization: Bearer <token>` and that your account is active. Tokens may expire; log in again.
- **How do I change a password?** Call `PUT /api/auth/change-password` with `currentPassword` and `newPassword`. The new password is hashed automatically by model hooks.
- **Can an admin deactivate themselves?** No. The server blocks deactivating or deleting your own admin user.
- **Uploads fail with invalid type.** The file MIME must be one of the allowlisted types in `routes/files.js`.
- **Are files stored securely?** In development, files land in `server/uploads`. Restrict access at the infrastructure level or move to S3 in production.
- **Can I add new models?** Yes. Create a model file under `models/`, import and associate it in `models/index.js`, then restart the server. In dev, `sync({ alter: true })` updates the schema.

