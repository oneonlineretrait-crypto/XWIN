import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Pronostics } from './pages/Pronostics'
import { Montantes } from './pages/Montantes'
import { Produits } from './pages/Produits'
import { Abonnement } from './pages/Abonnement'
import { PaiementSucces } from './pages/PaiementSucces'
import { PaiementAnnule } from './pages/PaiementAnnule'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/inscription" element={<Signup />} />
          <Route path="/paiement/succes" element={<PaiementSucces />} />
          <Route path="/paiement/annule" element={<PaiementAnnule />} />

          <Route path="/pronostics" element={<ProtectedRoute><Pronostics /></ProtectedRoute>} />
          <Route path="/montantes" element={<ProtectedRoute><Montantes /></ProtectedRoute>} />
          <Route path="/produits" element={<ProtectedRoute><Produits /></ProtectedRoute>} />
          <Route path="/abonnement" element={<ProtectedRoute><Abonnement /></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/pronostics" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
