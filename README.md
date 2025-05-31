# 🥗 GetIntoMealPrep – Fullstack Web App

**GetIntoMealPrep** is a fullstack web application designed to make meal prepping simple and efficient.

Users can:

- Browse a curated collection of tried-and-true meal prep recipes
- Add recipes to their personal digital cookbook
- View each recipe in detail, including ingredients and preparation steps
- Create weekly meal plans using a built-in planner with drag-and-drop features

**Upcoming:** Nutritional analysis (macronutrients, calories) to generate smart recipe suggestions.

---

## 🧰 Tech Stack

**Backend:**

- ASP.NET Core (.NET 9, C#)
- PostgreSQL 15
- Entity Framework Core
- JWT Bearer Token Authentication
- Logto (IDP) – Email-verified user registration & login

**Frontend:**

- Vite + React + TypeScript
- PrimeReact Component Library

**DevOps & Hosting:**

- Docker Compose (for local development)
- Nginx Reverse Proxy (production)
- Ubuntu vServer, SSL via Let's Encrypt

> 🔐 The project was previously hosted at [https://www.getintomealprep.de](https://www.getintomealprep.de) with HTTPS (Let's Encrypt), but has since been taken offline due to server costs.

---

## 🔐 Authentication

All users register and log in via **Logto**, with **email validation**.  
The backend API is protected by **Bearer Token Authentication**.

---

## 📦 Developer Setup

The full developer setup using Docker is described in:

👉 [GetIntoMealPrep_Developer_Setup_Guide.md](./GetIntoMealPrep_Developer_Setup_Guide.md)

Key commands:

```bash
docker compose up
dotnet ef database update --project GetIntoMealPrepAPI
```

The setup includes:

- Frontend & backend with hot reload inside containers
- Postgres DB with schema migrations
- Nginx reverse proxy

---

## 🧪 Testing

The frontend is tested with **Vitest**.

### 📊 Test Coverage

```
Test Files  40 passed (40)
      Tests  370 passed (370)
   Start at  17:35:56
   Duration  14.95s (transform 2.18s, setup 16.33s, collect 11.76s, tests 17.22s, environment 44.75s, prepare 7.84s)

 % Coverage report from v8
---------------------------------------------------|---------|----------|---------|---------|-------------------
File                                               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------------------------------------------|---------|----------|---------|---------|-------------------
All files                                          |   98.17 |    97.99 |    95.4 |   98.17 |                  
 src                                               |     100 |      100 |     100 |     100 |                  
  App.tsx                                          |     100 |      100 |     100 |     100 |                  
 src/components/Button                             |     100 |      100 |     100 |     100 |                  
  Button.tsx                                       |     100 |      100 |     100 |     100 |                  
 src/components/Callback                           |     100 |      100 |     100 |     100 |                  
  Callback.tsx                                     |     100 |      100 |     100 |     100 |                  
 src/components/Footer                             |     100 |      100 |     100 |     100 |                  
  Footer.tsx                                       |     100 |      100 |     100 |     100 |                  
 src/components/Header                             |     100 |      100 |     100 |     100 |                  
  Header.tsx                                       |     100 |      100 |     100 |     100 |                  
 src/components/LikeButton                         |     100 |     97.5 |     100 |     100 |                  
  LikeButton.tsx                                   |     100 |    96.15 |     100 |     100 | 56               
  useRecipeLikeStatus.ts                           |     100 |      100 |     100 |     100 |                  
...
```

---

## 🎞️ UI Preview

![App Demo GIF](screenshots/app-demo.gif)

> Drag-and-drop planner, recipe viewer, and cookbook management in action.

---

## 📄 License

MIT License – open source and free to use.
