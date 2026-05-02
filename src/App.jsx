import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { MainLayout } from './layouts/MainLayout.jsx';
import { Home } from './pages/Home.jsx';
import { Login } from './pages/Login.jsx';
import { Registro } from './pages/Registro.jsx';
import { Catalogo } from './pages/Catalogo.jsx';
import { ProductoDetalle } from './pages/ProductoDetalle.jsx';
import { Carrito } from './pages/Carrito.jsx';
import { Checkout } from './pages/Checkout.jsx';
import { CheckoutRecibo } from './pages/CheckoutRecibo.jsx';
import { DashboardVendedor } from './pages/DashboardVendedor.jsx';
import { PanelDirector } from './pages/PanelDirector.jsx';
import { PanelBam } from './pages/PanelBam.jsx';
import { PanelAdmin } from './pages/PanelAdmin.jsx';
import { CuentaLayout } from './layouts/CuentaLayout.jsx';
import { CuentaPerfil } from './pages/CuentaPerfil.jsx';
import { CuentaFavoritos } from './pages/CuentaFavoritos.jsx';
import { CuentaConfiguracion } from './pages/CuentaConfiguracion.jsx';
import { MisPedidos } from './pages/MisPedidos.jsx';
import { ROLES } from './auth/roles.js';

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/catalog" element={<Catalogo />} />
        <Route path="/catalogo" element={<Navigate to="/catalog" replace />} />

        <Route path="/product/:id" element={<ProductoDetalle />} />
        <Route path="/producto/:id" element={<ProductoDetalle />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Carrito />
            </ProtectedRoute>
          }
        />
        <Route path="/carrito" element={<Navigate to="/cart" replace />} />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/recibo"
          element={
            <ProtectedRoute>
              <CheckoutRecibo />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Registro />} />
        <Route path="/registro" element={<Navigate to="/register" replace />} />

        <Route
          path="/cuenta"
          element={
            <ProtectedRoute>
              <CuentaLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="perfil" replace />} />
          <Route path="perfil" element={<CuentaPerfil />} />
          <Route path="pedidos" element={<MisPedidos />} />
          <Route path="favoritos" element={<CuentaFavoritos />} />
          <Route path="configuracion" element={<CuentaConfiguracion />} />
        </Route>

        <Route
          path="/seller"
          element={
            <ProtectedRoute>
              <DashboardVendedor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/director"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <PanelDirector />
            </ProtectedRoute>
          }
        />
        <Route
          path="/director/bam"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <PanelBam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/director/admin"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <PanelAdmin />
            </ProtectedRoute>
          }
        />
        <Route path="/vendedor" element={<Navigate to="/seller" replace />} />

        <Route path="/become-seller" element={<Navigate to="/seller" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}
