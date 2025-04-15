import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Orders from "./pages/Orders";
import MaterialDetails from "./pages/MaterialDetails";
import Recipes from "./pages/Recipes";
import Batches from "./pages/Batches";
import Sidebar from "./components/Sidebar";
import MaterialForm from "./pages/MaterialForm";
import RecipeEditForm from "./pages/RecipeEditForm";
import EditMaterial from "./pages/EditMaterial";
import MaterialTransactionPage from "./pages/MaterialTransactionForm";
import ThemeToggle from "./pages/ThemeToggle";
import ActiveOrders from "./pages/ActiveOrders";
import Topbar from "./pages/Topbar";
import ViewOrder from "./pages/ViewOrder";
import ViewRecipe from "./pages/ViewRecipe";
import Bucket_Batches from "./pages/Bucket_Batches";
import ViewMaterial from "./pages/ViewMaterial";
import CreateStorageBucketForm from "./pages/CreateStorageBucketForm"; // Adjust path as necessary

// Layout component for shared UI like Sidebar/Topbar
function Layout({ children }) {
  const location = useLocation();
  const hideForRoutes = ["/login"];
  const shouldHideTopbar = hideForRoutes.includes(location.pathname);

  return (
    <div className="flex h-screen">
      {!shouldHideTopbar && <Sidebar />}
      <div className="flex-1 p-6 bg-gray-100 overflow-auto relative">
        {!shouldHideTopbar && <Topbar />}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  );
}

function AppRoutes() {
  const [materials, setMaterials] = useState([]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/material" element={<MaterialDetails />} />
        <Route path="/material/create" element={<MaterialForm setMaterials={setMaterials} />} />
        <Route path="/material/:material_id" element={<EditMaterial />} />
        <Route path="/material/view/:material_id" element={<ViewMaterial />} />
        <Route path="/material-transactions" element={<MaterialTransactionPage />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:order_id" element={<ViewOrder />} />
        <Route path="/activeorders" element={<ActiveOrders />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/edit/:recipe_id" element={<RecipeEditForm />} />
        <Route path="/recipes/:recipe_id" element={<ViewRecipe />} />
        <Route path="/batches" element={<Batches />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/storage" element={<Bucket_Batches />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-storage" element={<CreateStorageBucketForm />} />
      </Routes>
    </Layout>
  );
}

function AppContent() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
