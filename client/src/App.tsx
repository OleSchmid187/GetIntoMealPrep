import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import './App.css'
import Footer from "./components/Footer/Footer";
import Dashboard from "./pages/Dashboard/Dashboard";
import AllRecipes from "./pages/Recipes/AllRecipes";
import RecipeDetails from "./pages/Recipes/RecipeDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/recipes" element={<AllRecipes />} />
        <Route path="/recipes/:id" element={<RecipeDetails />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App
