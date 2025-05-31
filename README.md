# GetIntoMealPrep – Fullstack Web App

**GetIntoMealPrep** is a fullstack web application designed to make meal prepping simple and efficient.

Users can:

- Browse a curated collection of tried-and-true meal prep recipes
- Add recipes to their personal digital cookbook
- View each recipe in detail, including ingredients and preparation steps
- Create weekly meal plans using a built-in planner with drag-and-drop features

**Upcoming:** Nutritional analysis (macronutrients, calories) to generate smart recipe suggestions.

---

## Tech Stack

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

## Developer Setup

The full developer setup using Docker is described in:

👉 [GetIntoMealPrep_Developer_Setup_Guide.md](./GetIntoMealPrep_Developer_Setup_Guide.md)

The setup includes:

- Frontend & backend with hot reload inside containers
- Postgres DB with schema migrations
- Nginx reverse proxy

---

## Testing

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
 src/components/ProtectedRoute                     |     100 |      100 |     100 |     100 |                  
  ProtectedRoute.tsx                               |     100 |      100 |     100 |     100 |                  
 src/components/RecipeCard                         |     100 |      100 |     100 |     100 |                  
  RecipeCard.tsx                                   |     100 |      100 |     100 |     100 |                  
 src/components/RecipeGrid                         |     100 |      100 |     100 |     100 |                  
  RecipeGrid.tsx                                   |     100 |      100 |     100 |     100 |                  
 src/components/RecipeImage                        |     100 |      100 |     100 |     100 |                  
  RecipeImage.tsx                                  |     100 |      100 |     100 |     100 |                  
 src/pages/Dashboard                               |     100 |      100 |     100 |     100 |                  
  Dashboard.tsx                                    |     100 |      100 |     100 |     100 |                  
 src/pages/Dashboard/DashboardCards                |     100 |      100 |     100 |     100 |                  
  DashboardCards.tsx                               |     100 |      100 |     100 |     100 |                  
 src/pages/Dashboard/DashboardPanel                |     100 |      100 |     100 |     100 |                  
  DashboardPanel.tsx                               |     100 |      100 |     100 |     100 |                  
 src/pages/Dashboard/DashboardStats                |     100 |      100 |     100 |     100 |                  
  DashboardStats.tsx                               |     100 |      100 |     100 |     100 |                  
 src/pages/Dashboard/RecipeSuggestions             |     100 |      100 |     100 |     100 |                  
  RecipeSuggestions.tsx                            |     100 |      100 |     100 |     100 |                  
  useRecipeSuggestions.ts                          |     100 |      100 |     100 |     100 |                  
 src/pages/Dashboard/RecipeSuggestions/RecipeModal |     100 |      100 |     100 |     100 |                  
  RecipeModal.tsx                                  |     100 |      100 |     100 |     100 |                  
 src/pages/Home                                    |     100 |      100 |     100 |     100 |                  
  Home.tsx                                         |     100 |      100 |     100 |     100 |                  
 src/pages/Home/CTASection                         |     100 |      100 |     100 |     100 |                  
  CTASection.tsx                                   |     100 |      100 |     100 |     100 |                  
 src/pages/Home/FeatureSection                     |     100 |      100 |     100 |     100 |                  
  FeatureSection.tsx                               |     100 |      100 |     100 |     100 |                  
 src/pages/Home/HeroSection                        |     100 |      100 |     100 |     100 |                  
  HeroSection.tsx                                  |     100 |      100 |     100 |     100 |                  
 src/pages/MyRecipes                               |     100 |      100 |     100 |     100 |                  
  MyRecipes.tsx                                    |     100 |      100 |     100 |     100 |                  
  useLikedRecipes.ts                               |     100 |      100 |     100 |     100 |                  
 src/pages/Planner                                 |   89.23 |    88.88 |   63.63 |   89.23 |                  
  Planner.tsx                                      |   80.55 |      100 |   33.33 |   80.55 | 73-76,79-104,152 
  useMealPlan.ts                                   |     100 |    85.71 |     100 |     100 | 35,48,90,126,145 
 src/pages/Planner/PlannerCell                     |     100 |      100 |     100 |     100 |                  
  PlannerCell.tsx                                  |     100 |      100 |     100 |     100 |                  
 src/pages/Planner/PlannerMealCard                 |     100 |      100 |     100 |     100 |                  
  PlannerMealCard.tsx                              |     100 |      100 |     100 |     100 |                  
 src/pages/Planner/RecipeSelectDialog              |     100 |      100 |     100 |     100 |                  
  RecipeSelectDialog.tsx                           |     100 |      100 |     100 |     100 |                  
  useRecipeSelectDialog.ts                         |     100 |      100 |     100 |     100 |                  
 src/pages/Planner/WeekSwitcher                    |     100 |      100 |     100 |     100 |                  
  WeekSwitcher.tsx                                 |     100 |      100 |     100 |     100 |                  
 src/pages/Profil                                  |     100 |      100 |     100 |     100 |                  
  Profil.tsx                                       |     100 |      100 |     100 |     100 |                  
 src/pages/Recipes/AllRecipes                      |     100 |      100 |     100 |     100 |                  
  AllRecipes.tsx                                   |     100 |      100 |     100 |     100 |                  
  useAllRecipes.ts                                 |     100 |      100 |     100 |     100 |                  
 src/pages/Recipes/RecipeDetails                   |     100 |      100 |     100 |     100 |                  
  RecipeDetails.tsx                                |     100 |      100 |     100 |     100 |                  
  useRecipeDetails.ts                              |     100 |      100 |     100 |     100 |                  
 src/types                                         |     100 |      100 |     100 |     100 |                  
  mealType.ts                                      |     100 |      100 |     100 |     100 |                  
  recipe.ts                                        |     100 |      100 |     100 |     100 |                  
 src/utils                                         |     100 |      100 |     100 |     100 |                  
  dateUtils.ts                                     |     100 |      100 |     100 |     100 |                  
  getImageUrl.ts                                   |     100 |      100 |     100 |     100 |                  
  sortMealPlanEntries.ts                           |     100 |      100 |     100 |     100 |                  
  useProfileData.ts                                |     100 |      100 |     100 |     100 |                  
---------------------------------------------------|---------|----------|---------|---------|-------------------
```

---

## 🎞️ UI Preview

![App Demo GIF](screenshots/app-demo.gif)

> Drag-and-drop planner, recipe viewer, and cookbook management in action.

---

## 📄 License

MIT License – open source and free to use.
