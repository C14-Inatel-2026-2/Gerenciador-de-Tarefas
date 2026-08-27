import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/login';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota inicial carrega o Login */}
        <Route path="/" element={<Login />} />
        
        {/* Rota /dashboard carrega o Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;