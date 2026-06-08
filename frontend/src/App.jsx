import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import RoleSelect from './pages/RoleSelect'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MyPets from './pages/MyPets'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'
import PetProfile from './pages/PetProfile'
import EditPet from './pages/EditPet'
import PublicPetProfile from './pages/PublicPetProfile'
import PetNfcProfile from './pages/PetNfcProfile'
import FoundPetPage from './pages/FoundPetPage'
import LostPet from './pages/LostPet'
import LguDashboard from './pages/LguDashboard'
import CommunityLostPets from './pages/CommunityLostPets'
import ReportSighting from './pages/ReportSighting'
import AdoptionGallery from './pages/AdoptionGallery'
import PetTransfer from './pages/PetTransfer'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/role-select" element={<RoleSelect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tag/:tagId" element={<PublicPetProfile />} />
        <Route path="/found/:tagId" element={<FoundPetPage />} />
        <Route path="/community/lost" element={<CommunityLostPets />} />
        <Route path="/sighting/:reportId" element={<ReportSighting />} />
        <Route path="/adoptions" element={<AdoptionGallery />} />

        {/* Pet Owner Routes (Protected) */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/pets" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <MyPets />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/alerts" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <Alerts />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/settings" element={
          <ProtectedRoute allowedRoles={['owner', 'lgu', 'admin']}>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/pet/new" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <EditPet />
          </ProtectedRoute>
        } />
        <Route path="/pet/:id/edit" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <EditPet />
          </ProtectedRoute>
        } />
        <Route path="/pet/:tagId" element={<PetNfcProfile />} />
        <Route path="/manage/pet/:id" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <PetProfile />
          </ProtectedRoute>
        } />
        <Route path="/lost/:id" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <LostPet />
          </ProtectedRoute>
        } />
        <Route path="/pet/transfer" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <PetTransfer />
          </ProtectedRoute>
        } />
        <Route path="/pet/:id/transfer" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <PetTransfer />
          </ProtectedRoute>
        } />

        {/* LGU Admin Routes (Protected) */}
        <Route path="/lgu" element={
          <ProtectedRoute allowedRoles={['lgu', 'admin']}>
            <LguDashboard />
          </ProtectedRoute>
        } />



        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
