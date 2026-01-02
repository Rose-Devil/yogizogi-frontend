import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Write from "./pages/Write";
import Map from "./pages/Map";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
import Checklist from "./pages/Checklist";
import ChecklistCreate from "./pages/ChecklistCreate";
import ChecklistDetail from "./pages/ChecklistDetail";
import ChecklistJoin from "./pages/ChecklistJoin";
import ForgotPassword from "./pages/ForgotPassword";
import ProfileEdit from "./pages/ProfileEdit";
import About from "./pages/About";
import Notice from "./pages/Notice";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import AdBanner from "./components/Adbanner";

function App() {
  return (
    <ThemeProvider defaultTheme="system" enableSystem>
      <AdBanner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/write" element={<Write />} />
        <Route path="/post/:id/edit" element={<Write />} />
        <Route path="/map" element={<Map />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/checklist/create" element={<ChecklistCreate />} />
        <Route path="/checklist/join/:inviteCode" element={<ChecklistJoin />} />
        <Route path="/checklist/:id" element={<ChecklistDetail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/notice" element={<Notice />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
