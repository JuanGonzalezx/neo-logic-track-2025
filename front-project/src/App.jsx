import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import './App.css';

import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import FileUploadPage from "./components/FileUpload/FileUploadPage";
import Dashboard from "./components/Dashboard/Dashboard";
import DashboardHome from "./components/Dashboard/DashboardHome/DashboardHome";
import UserList from "./components/Dashboard/Users/UserList";
import UserForm from "./components/Dashboard/Users/UserForm";
import RoleList from "./components/Dashboard/Roles/RoleList";
import RoleForm from "./components/Dashboard/Roles/RoleForm";
import Profile from "./components/Dashboard/Profile/Profile";
import RequestReset from "./components/Auth/RequestReset";
import NewPassword from "./components/Auth/NewPassword";
import RedirectByRole from "./components/Auth/RedirectByRole";

function App() {
  const navigate = useNavigate();
  let { isAuthenticated } = useSelector((state) => state.auth);

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/redirect" /> : <Login />} />
        <Route path="/redirect" element={<RedirectByRole />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/reset-password" element={<RequestReset />} />
        <Route path="/reset-password/new" element={<NewPassword />} />
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
          <Route path="inventory" element={<div>Inventory Management Coming Soon</div>} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;