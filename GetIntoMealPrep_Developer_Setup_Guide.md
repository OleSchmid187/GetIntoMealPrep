
# GetIntoMealPrep – Developer Setup Guide

A full stack web application built with:

- **Backend**: ASP.NET Core (.NET 9, C#)  
- **Frontend**: Node.js (Vite, React, etc.)  
- **Database**: PostgreSQL 15  
- **ORM**: Entity Framework Core  
- **Reverse Proxy**: Nginx  
- **Containers**: Docker Compose  

---

## Prerequisites

Before you start, make sure you have the following installed:

- Docker & Docker Compose  
- .NET 9 SDK  
- Node.js 20+ (optional, for local frontend dev)  

---

## Getting Started – Step by Step

### 1. Start All Services with Docker Compose

Bring up all containers in detached mode:

```bash
docker compose up
```

This starts:

- `db` – the PostgreSQL database  
- `api` – the .NET Core backend API (in watch mode)  
- `frontend` – the frontend dev server  
- `nginx` – the reverse proxy  

Wait a few seconds for all containers (especially the database) to become ready.

---

### 2. Run Entity Framework Core Migrations (From Host)

After the containers are running, you need to create the database schema.

#### Ensure Your Connection String Matches Docker

Your `GetIntoMealPrepAPI/appsettings.Development.json` should contain:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5433;Database=GetIntoMealPrepDb;Username=postgres;Password=tzutzu123"
}
```

> Note: Docker maps container port `5432` to host port `5433` for the database.

#### Run the Migration

From your host machine (not inside a container):

```bash
dotnet ef database update --project GetIntoMealPrepAPI
```

This will apply all existing migrations to your local Postgres DB running in Docker.

---

### 3. Restart All Docker Services

After the migration, restart the containers to ensure the backend picks up the changes.

You have two options:

#### Option A: Restart Only the API Container

```bash
docker compose restart api
```

#### Option B: Restart Everything (Recommended for Clean State)

```bash
docker compose down
docker compose up
```

---

### 4. Access the Application

- **Frontend**: [http://localhost](http://localhost)  
- **API Base Path (Proxy)**: [http://localhost/api](http://localhost/api)  
- **Swagger UI**: [http://localhost/api](http://localhost/api)  
- **Static Resources**: [http://localhost/resources](http://localhost/resources)  

> Nginx reverse proxy handles routing to the appropriate services.

---

## Common Development Commands

**Add a Migration:**

```bash
dotnet ef migrations add MigrationName --project GetIntoMealPrepAPI
```

**Update the Database:**

```bash
dotnet ef database update --project GetIntoMealPrepAPI
```

**Stop All Containers:**

```bash
docker compose down
```

---

## Notes for Developers

- **Code changes**: Both backend (`dotnet watch run`) and frontend (`npm run dev`) are running in hot-reload mode inside their containers.
- **Volumes**: Changes in your local `GetIntoMealPrepAPI` or `client` folders are automatically reflected inside containers.
- **EF Tools**: If you get errors about missing EF tools, install with:

  ```bash
  dotnet tool install --global dotnet-ef
  ```

- **Troubleshooting Ports**: If you have Postgres running locally outside Docker, make sure it’s not using port `5433` (or adjust your mappings).
- **Production**: Change default passwords, environment variables, and use production-ready images.
