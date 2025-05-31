import AdminDashboard from "../components/Dashboard/AdminDashboard";
import GerenteDashboard from "../components/Dashboard/GerenteDashboard";
import DespachadorDashboard from "../components/Dashboard/DespachadorDashboard";
import RepartidorDashboard from "../components/Dashboard/RepartidorDashboard";
import Unauthorized from "../components/Auth/Unauthorized"; // Página simple de acceso denegado

import ProtectedRoute from "./ProtectedRoute";
import Home from "../components/Home/Home";

<Routes>
  <Route path="/" element={<Home />} />
  {/* <Route path="/" element={isAuthenticated ? <Navigate to="/redirect" /> : <Home />} /> */}

  <Route path="/track/:orderId" element={<div>Tracking Page (Coming Soon)</div>} />

  <Route path="/admin" element={
      <AdminDashboard />
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