import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Splash } from './pages/Splash'
import { Auth } from './pages/Auth'
import { Pronostics } from './pages/Pronostics'
import { Montantes } from './pages/Montantes'
import { Produits } from './pages/Produits'
import { Abonnement } from './pages/Abonnement'
import { Profil } from './pages/Profil'
import { PaiementSucces } from './pages/PaiementSucces'
import { PaiementAnnule } from './pages/PaiementAnnule'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/paiement/succes" element={<PaiementSucces />} />
          <Route path="/paiement/annule" element={<PaiementAnnule />} />

          <Route path="/pronostics" element={<ProtectedRoute><Pronostics /></ProtectedRoute>} />
          <Route path="/montantes" element={<ProtectedRoute><Montantes /></ProtectedRoute>} />
          <Route path="/produits" element={<ProtectedRoute><Produits /></ProtectedRoute>} />
          <Route path="/abonnement" element={<ProtectedRoute><Abonnement /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
