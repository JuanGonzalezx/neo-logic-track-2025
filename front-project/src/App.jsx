import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { updateDeliveryLocation } from "./api/geoService"; 
import { getUserFromToken } from "./api/auth";
import { useEffect } from "react";
import './App.css';
// import jwtDecode from 'jwt-decode';

import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import FileUploadPage from "./components/FileUpload/FileUploadPage";
import Dashboard from "./components/Dashboard/Dashboard";
import DashboardHome from "./components/Dashboard/DashboardHome/DashboardHome";
import UserList from "./components/Dashboard/Users/UserList";
import UserForm from "./components/Dashboard/Users/UserForm";
import RoleList from "./components/Dashboard/Roles/RoleList";
import RoleForm from "./components/Dashboard/Roles/RoleForm";
import PermissionList from "./components/Dashboard/Permissions/PermissionList";
import PermissionForm from "./components/Dashboard/Permissions/PermissionForm";
import Profile from "./components/Dashboard/Profile/Profile";
import RequestReset from "./components/Auth/RequestReset";
import NewPassword from "./components/Auth/NewPassword";
import ProductList from './components/Dashboard/Products/ProductList'; // Ajusta la ruta
import ProductForm from './components/Dashboard/Products/ProductForm'; // Ajusta la ruta
import ChangeResetPassword from "./components/Auth/ChangeResetPassword";
import ProductDetail from './components/Dashboard/Products/ProductDetail'; // Ajusta la ruta
import ProductImport from "./components/Dashboard/Products/ProductImport";
import CategoryList from "./components/Dashboard/Categories/CategoryList";
import CategoryForm from "./components/Dashboard/Categories/CategoryForm";
import WarehouseList from "./components/Dashboard/Warehouses/WarehouseList";
import OrderList from "./components/Dashboard/Orders/OrderList";
import Home from "./components/Home/Home";
import OrderTrackingPage from "./components/Dashboard/Orders/OrderTrackingPanel";
import ListadoRepartidores from './components/Dashboard/Orders/DeliveryList.jsx/index';
function App() {
  let { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
  const getAndSendLocation = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    // const { id: userId } = jwtDecode(token);

    // Obtiene el usuario para revisar el rol
    console.log("Tokensss:", token);
    const user = await getUserFromToken({token});
    console.log("Usuario autenticado:", user);
    if (user?.role.id !== '68146313ef7752d9d59866da') return;
    console.log("Usuario autenticado es repartidor:", user);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        // Necesitas también cityId y street, podrías obtenerlos de user o pedirlos una vez
        const cityId = user.ciudadId || "manizales-1"; // Ajusta según tu modelo
        const street = user.street || "va en ruta";   // Ajusta según tu modelo
        const postalCode = user.postalCode || "170001"; // Ajusta según tu modelo
        await updateDeliveryLocation({ userId: user.id , latitude: lat, longitude: lon, cityId, street,postal_code: postalCode });
      });
    }
  };

  getAndSendLocation();
  const interval = setInterval(getAndSendLocation, 15000);
  return () => clearInterval(interval);
}, []);
  
  if (localStorage.getItem("token")) {
    isAuthenticated = true;
  }

  // Component to protect routes
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/reset-password" element={<RequestReset />} />
      <Route path="/changeResetPassword/:token" element={<ChangeResetPassword />} />
      <Route
        path="/file"
        element={
          <ProtectedRoute>
            <FileUploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="users" element={<UserList />} />
        <Route path="users/create" element={<UserForm />} />
        <Route path="users/edit/:id" element={<UserForm editMode={true} />} />
        <Route path="roles" element={<RoleList />} />
        <Route path="roles/create" element={<RoleForm />} />
        <Route path="roles/edit/:id" element={<RoleForm editMode={true} />} />
        <Route path="permissions" element={<PermissionList />} />
        <Route path="permissions/create" element={<PermissionForm />} />
        <Route path="permissions/edit/:id" element={<PermissionForm editMode={true} />} />
        <Route path="/dashboard/inventory" element={<ProductList />} /> {/* Lista de productos */}
        <Route path="/dashboard/inventory/add" element={<ProductForm />} /> {/* Formulario para añadir */}
        <Route path="/dashboard/inventory/:id" element={<ProductDetail />} />
        <Route path="/dashboard/inventory/import" element={<ProductImport />} /> {/* Importación masiva */}
        <Route path="/dashboard/inventory/edit/:id" element={<ProductForm editMode={true} />} />  {/* Formulario para editar */}
        <Route path="/dashboard/inventory/categories" element={<CategoryList />} /> {/* Lista de categorías */}
        <Route path="/dashboard/inventory/categories/add" element={<CategoryForm />} /> {/* Formulario para añadir categoría */}
        <Route path="/dashboard/inventory/warehouses" element={<WarehouseList />} /> {/* Lista de almacenes */}
        <Route path="/dashboard/inventory/orders" element={<OrderList />} />
        <Route path="profile" element={<Profile />} />
        <Route path="/dashboard/inventory/orders/:orderId/tracking" element={<OrderTrackingPage />} />
          <Route path="repartidores" element={<ListadoRepartidores />} />
      </Route>
      <Route path="/track/:orderId" element={<OrderTrackingPage />} />
    </Routes>
  );
}

export default App;