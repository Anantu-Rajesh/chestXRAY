import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Overview from "./pages/Overview";
import Home from "./pages/Home";
import History from "./pages/History";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token")
  return token ? children : <Navigate to="/login" />
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/home" element={<Home />} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};
 
export default App;