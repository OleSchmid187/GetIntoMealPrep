import "primeicons/primeicons.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import './App.css'
import Footer from "./components/Footer/Footer";
import Dashboard from "./pages/Dashboard/Dashboard";
import AllRecipes from "./pages/Recipes/AllRecipes/AllRecipes";
import RecipeDetails from "./pages/Recipes/RecipeDetails/RecipeDetails";
import { LogtoProvider, LogtoConfig } from '@logto/react';
import Callback from "./components/Callback/Callback";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import logtoConfig from "./config/logtoConfig";
import Profil from "./pages/Profil/Profil";
import Header from "./components/Header/Header";
import Planner from "./pages/Planner/Planner";
import MyRecipes from "./pages/MyRecipes/MyRecipes";

const config: LogtoConfig = logtoConfig;

function App() {
  return (
    <LogtoProvider config={config}>
      <Router>
      <Header/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/callback" element={<Callback />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes"
            element={
              <ProtectedRoute>
                <AllRecipes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes/:id"
            element={
              <ProtectedRoute>
                <RecipeDetails />
              </ProtectedRoute>
            }
          />
          <Route path="/profil" element={<Profil />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/my-recipes" element={<MyRecipes />} />
        </Routes>
        <Footer />
      </Router>
    </LogtoProvider>
  );
}

export default App
