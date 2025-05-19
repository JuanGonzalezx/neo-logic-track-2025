import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import AppLoader from "./AppLoader"; // Ajusta la ruta

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
import ProductList from './components/Dashboard/Products/ProductList';
import ProductForm from './components/Dashboard/Products/ProductForm';
import ChangeResetPassword from "./components/Auth/ChangeResetPassword";
import ProductDetail from './components/Dashboard/Products/ProductDetail';
import ProductImport from "./components/Dashboard/Products/ProductImport";
import CategoryList from "./components/Dashboard/Categories/CategoryList";
import CategoryForm from "./components/Dashboard/Categories/CategoryForm";
import WarehouseList from "./components/Dashboard/Warehouses/WarehouseList";

function App() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" />;
    }
    return children;
  };

  return (
    <>
      <AppLoader />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
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
          <Route path="inventory" element={<ProductList />} />
          <Route path="inventory/add" element={<ProductForm />} />
          <Route path="inventory/:id" element={<ProductDetail />} />
          <Route path="inventory/import" element={<ProductImport />} />
          <Route path="inventory/edit/:id" element={<ProductForm editMode={true} />} />
          <Route path="inventory/categories" element={<CategoryList />} />
          <Route path="inventory/categories/add" element={<CategoryForm />} />
          <Route path="inventory/warehouses" element={<WarehouseList />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
