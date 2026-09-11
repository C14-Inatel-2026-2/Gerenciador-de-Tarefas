import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/login';
import { Home } from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota inicial carrega o Login */}
        <Route path="/" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
