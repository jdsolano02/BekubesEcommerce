import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import ClientHome from "./ClientHome";
import AdminHome from "./AdminHome";
import PrivateRoute from "./PrivateRoute";
import Unauthorized from "./Unauthorized";
import RegisterForm from "./RegisterForm";
import Usuarios from "./Usuario";
import EditUser from "./EditUser";
import RegisterAdmin from "./RegisterAdmin";
import ResetPassword from "./ResetPassword";
import ChangePassword from "./ChangePassword";
import GestionProductos from "./GestionProductos";
import CatalogoProductos from "./CatalogoProductos";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register-form" element={<RegisterForm />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/edit-user/:id" element={<EditUser />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* Rutas protegidas Cliente */}
        <Route
          path="/client-home"
          element={
            <PrivateRoute role="Cliente">
              <ClientHome />
            </PrivateRoute>
          }
        />
                                     <Route
          path="/catalogo-productos"
          element={
            <PrivateRoute role="Cliente">
              <CatalogoProductos />
            </PrivateRoute>
          }
        />
        {/* Rutas protegidas Administrador */}
        <Route
          path="/admin-home"
          element={
            <PrivateRoute role="Administrador">
              <AdminHome />
            </PrivateRoute>
          }
        />
                <Route
          path="/usuarios"
          element={
            <PrivateRoute role="Administrador">
              <Usuarios />
            </PrivateRoute>
          }
        />
             <Route
          path="/register-admin"
          element={
            <PrivateRoute role="Administrador">
              <RegisterAdmin />
            </PrivateRoute>
          }
        />
                     <Route
          path="/gestion-productos"
          element={
            <PrivateRoute role="Administrador">
              <GestionProductos />
            </PrivateRoute>
          }
        />


        {/* Página para usuarios no autorizados */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Redirigir por defecto al login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;