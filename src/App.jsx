import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { Login } from './pages/Login.jsx';
import { Registro } from './pages/Registro.jsx';
import { Catalogo } from './pages/Catalogo.jsx';
import { Carrito } from './pages/Carrito.jsx';
import { Checkout } from './pages/Checkout.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/catalogo" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="*" element={<Navigate to="/catalogo" replace />} />
      </Routes>
    </Layout>
  );
}
