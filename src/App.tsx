import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Splash } from './pages/Splash'
import { Landing } from './pages/Landing'
import { Auth } from './pages/Auth'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { Pronostics } from './pages/Pronostics'
import { MatchDetail } from './pages/MatchDetail'
import { Historique } from './pages/Historique'
import { Montantes } from './pages/Montantes'
import { MontanteDetail } from './pages/MontanteDetail'
import { Produits } from './pages/Produits'
import { ProduitDetail } from './pages/ProduitDetail'
import { Abonnement } from './pages/Abonnement'
import { Profil } from './pages/Profil'
import { Conditions } from './pages/Conditions'
import { Confidentialite } from './pages/Confidentialite'
import { NotFound } from './pages/NotFound'
import { PaiementSucces } from './pages/PaiementSucces'
import { PaiementAnnule } from './pages/PaiementAnnule'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/accueil" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
          <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
          <Route path="/paiement/succes" element={<PaiementSucces />} />
          <Route path="/paiement/annule" element={<PaiementAnnule />} />

          <Route path="/pronostics" element={<ProtectedRoute><Pronostics /></ProtectedRoute>} />
          <Route path="/pronostics/:matchId" element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />
          <Route path="/historique" element={<ProtectedRoute><Historique /></ProtectedRoute>} />
          <Route path="/montantes" element={<ProtectedRoute><Montantes /></ProtectedRoute>} />
          <Route path="/montantes/:montanteId" element={<ProtectedRoute><MontanteDetail /></ProtectedRoute>} />
          <Route path="/produits" element={<ProtectedRoute><Produits /></ProtectedRoute>} />
          <Route path="/produits/:productId" element={<ProtectedRoute><ProduitDetail /></ProtectedRoute>} />
          <Route path="/abonnement" element={<ProtectedRoute><Abonnement /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
          <Route path="/conditions" element={<Conditions />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
