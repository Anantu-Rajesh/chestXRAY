import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/xray.webp";
 
const Navbar = ({ variant = "home" }) => {
  const navigate = useNavigate();
 
  // auth check
  const token = localStorage.getItem("token")
  const isLoggedIn = !!token
  const userName = localStorage.getItem("userName")  
 
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userName")
    navigate("/")
  };
 
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
      style={{
        background: "rgba(10, 10, 10, 0.72)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="relative">
          <img
            src={logo}
            alt="PneuScan logo"
            className="w-8 h-8 rounded-md object-cover"
            style={{ background: "rgba(99, 102, 241, 0.16)", border: "1px solid rgba(99, 102, 241, 0.28)" }}
          />
        </div>
        <span className="text-white font-semibold tracking-tight text-sm">
          PneuScan
        </span>
      </Link>
 
      {/* Nav Links - only shown on home variant */}
      {variant === "home" && (
        <div className="hidden md:flex items-center gap-6">
          <Link to="/home" className="text-sm transition-colors duration-200"
            style={{ color: "rgba(255, 255, 255, 0.5)" }}
            onMouseEnter={e => e.target.style.color = "#6366F1"}
            onMouseLeave={e => e.target.style.color = "rgba(255, 255, 255, 0.5)"}
          >
            Scan
          </Link>
          {isLoggedIn && (
            <Link to="/history" className="text-sm transition-colors duration-200"
              style={{ color: "rgba(255, 255, 255, 0.5)" }}
              onMouseEnter={e => e.target.style.color = "#6366F1"}
              onMouseLeave={e => e.target.style.color = "rgba(255, 255, 255, 0.5)"}
            >
              History
            </Link>
          )}
        </div>
      )}
 
      {/* Auth Buttons */}
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <>
            <span className="text-sm" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
              {/* TODO: show user.name or user.email here */}
              {userName || "User"}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-1.5 rounded-md transition-all duration-200"
              style={{
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm px-4 py-1.5 rounded-md transition-all duration-200"
              style={{ color: "rgba(255, 255, 255, 0.5)" }}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-sm px-4 py-1.5 rounded-md transition-all duration-200"
              style={{
                background: "rgba(99, 102, 241, 0.12)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "#F8F8F8",
              }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  );
};
 
export default Navbar;