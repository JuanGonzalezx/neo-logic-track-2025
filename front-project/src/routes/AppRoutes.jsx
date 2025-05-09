import AdminDashboard from "../components/Dashboard/AdminDashboard";
import GerenteDashboard from "../components/Dashboard/GerenteDashboard";
import DespachadorDashboard from "../components/Dashboard/DespachadorDashboard";
import RepartidorDashboard from "../components/Dashboard/RepartidorDashboard";
import Unauthorized from "../components/Auth/Unauthorized"; // Página simple de acceso denegado

import ProtectedRoute from "./ProtectedRoute";

<Routes>
  <Route path="/" element={isAuthenticated ? <Navigate to="/redirect" /> : <Login />} />

  <Route path="/admin" element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  } />

  <Route path="/gerente" element={
    <ProtectedRoute allowedRoles={["gerente"]}>
      <GerenteDashboard />
    </ProtectedRoute>
  } />

  <Route path="/despachador" element={
    <ProtectedRoute allowedRoles={["despachador"]}>
      <DespachadorDashboard />
    </ProtectedRoute>
  } />

  <Route path="/repartidor" element={
    <ProtectedRoute allowedRoles={["repartidor"]}>
      <RepartidorDashboard />
    </ProtectedRoute>
  } />

  <Route path="/unauthorized" element={<Unauthorized />} />

  {/* Ruta por defecto */}
  <Route path="*" element={<Navigate to="/" />} />
</Routes>