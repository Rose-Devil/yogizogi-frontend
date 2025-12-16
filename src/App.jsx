import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Write from './pages/Write'
import Map from './pages/Map'
import PostDetail from './pages/PostDetail'
import Profile from './pages/Profile'
import Checklist from './pages/Checklist'
import ChecklistCreate from './pages/ChecklistCreate'
import ChecklistDetail from './pages/ChecklistDetail'

function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/write" element={<Write />} />
        <Route path="/map" element={<Map />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/checklist/create" element={<ChecklistCreate />} />
        <Route path="/checklist/:id" element={<ChecklistDetail />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App



