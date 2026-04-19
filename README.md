# Finance Superapp

A starter full-stack application for small-business finance utilities, built as a scalable modular monorepo with:

- `backend/`: Spring Boot REST API
- `frontend/`: React + TypeScript + Vite UI

## Current utilities

- Compound Interest Calculator
- Calculator with simple and scientific modes
- EMI Calculator

## Architecture highlights

### Backend

- Feature-based modules instead of a flat controller/service dump
- Stateless REST design with validation and centralized exception handling
- JWT-ready security structure using a `JwtAuthenticationFilter` and `JwtTokenVerifier` extension point
- Utility catalog endpoint to drive the home dashboard

Key packages:

- `com.finance.superapp.utilitycatalog`
- `com.finance.superapp.compoundinterest`
- `com.finance.superapp.calculator`
- `com.finance.superapp.emi`
- `com.finance.superapp.auth`
- `com.finance.superapp.common`

### Frontend

- Route-based screens for each utility
- Searchable alphabetical utility dashboard
- Small API client layer isolated from UI components
- Feature folders for each business utility so future modules can be added cleanly

## API endpoints

- `GET /api/v1/utilities`
- `POST /api/v1/utilities/compound-interest/calculate`
- `POST /api/v1/utilities/calculator/evaluate`
- `POST /api/v1/utilities/emi/calculate`

## Run locally

### Backend

Prerequisites:

- Java 21+
- Maven 3.9+

Commands:

```bash
cd backend
mvn spring-boot:run
```

### Frontend

Prerequisites:

- Node.js 18+
- npm 9+

Commands:

```bash
cd frontend
npm install
npm run dev
```

The Vite config proxies `/api` to `http://localhost:8080` in local development. You can override the API base URL by copying `frontend/.env.example` to `frontend/.env`.

## Recommended next enhancements

1. Add persistence and user-specific saved scenarios with PostgreSQL.
2. Implement JWT verification against your chosen auth provider using `JwtTokenVerifier`.
3. Add role-based access rules as utilities become customer-specific.
4. Introduce observability and rate limiting once traffic starts growing.
5. Add more finance modules without changing the dashboard architecture.

## Notes

- This environment did not have Maven or Gradle installed, so the backend source was scaffolded but not executed here.
- The frontend source was scaffolded, but dependencies were not installed in this session.
