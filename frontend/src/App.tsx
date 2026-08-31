import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/login';
import { Home } from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota inicial carrega o Login */}
        <Route path="/" element={<Login />} />
        
        {/* Rota /home carrega o Home */}
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;