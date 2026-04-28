import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout.jsx';
import { Home } from './pages/Home.jsx';
import { Login } from './pages/Login.jsx';
import { Registro } from './pages/Registro.jsx';
import { Catalogo } from './pages/Catalogo.jsx';
import { ProductoDetalle } from './pages/ProductoDetalle.jsx';
import { Carrito } from './pages/Carrito.jsx';
import { Checkout } from './pages/Checkout.jsx';
import { DashboardVendedor } from './pages/DashboardVendedor.jsx';

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/catalog" element={<Catalogo />} />
        <Route path="/catalogo" element={<Navigate to="/catalog" replace />} />

        <Route path="/product/:id" element={<ProductoDetalle />} />
        <Route path="/producto/:id" element={<ProductoDetalle />} />

        <Route path="/cart" element={<Carrito />} />
        <Route path="/carrito" element={<Navigate to="/cart" replace />} />

        <Route path="/checkout" element={<Checkout />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Registro />} />
        <Route path="/registro" element={<Navigate to="/register" replace />} />

        <Route path="/seller" element={<DashboardVendedor />} />
        <Route path="/vendedor" element={<Navigate to="/seller" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}
