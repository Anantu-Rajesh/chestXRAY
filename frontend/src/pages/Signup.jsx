import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/Layout";

 
const Signup = () => {
  const navigate = useNavigate();
 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 
  const handleSubmit = async () => {
    setError("");
 
    if (!email.includes("@")) {
      setError("Enter a valid email address")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
 
    setLoading(true);
    const res = await fetch("http://localhost:8000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok) {
       localStorage.setItem("token", data.access_token)
        localStorage.setItem("user", JSON.stringify(data.user))
       navigate("/home")
     } else {
       setError(data.message)
     }
    setLoading(false);
  };
 
  const fields = [
    { label: "Name", type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "Your name" },
    { label: "Email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com" },
    { label: "Password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "••••••••" },
  ];
 
  return (
    <Layout navVariant="overview">
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div
            className="rounded-2xl p-8"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-1">Create account</h2>
              <p className="text-sm" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                Save your scans and access history
              </p>
            </div>
 
            {/* Fields */}
            <div className="space-y-4 mb-6">
              {fields.map((field) => (
                <div key={field.label}>
                  <label className="block text-xs mb-2" style={{ color: "rgba(255, 255, 255, 0.35)" }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{
                      background: "rgba(0, 0, 0, 0.35)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      color: "#F8F8F8",
                    }}
                    onFocus={e => e.target.style.borderColor = "rgba(99, 102, 241, 0.55)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255, 255, 255, 0.08)"}
                  />
                </div>
              ))}
            </div>
 
            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs mb-4 px-3 py-2 rounded-lg"
                style={{ background: "rgba(239,68,68,0.08)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                {error}
              </motion.p>
            )}
 
            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: loading ? "rgba(99, 102, 241, 0.06)" : "rgba(99, 102, 241, 0.12)",
                border: "1px solid rgba(99, 102, 241, 0.28)",
                color: loading ? "rgba(255, 255, 255, 0.45)" : "#F8F8F8",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
 
            {/* Footer link */}
            <p className="text-center text-xs mt-6" style={{ color: "rgba(255, 255, 255, 0.35)" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#F8F8F8" }}>Login</Link>
            </p>
          </div>
 
          {/* Guest option */}
          <p className="text-center text-xs mt-4">
            <Link to="/home" style={{ color: "#F8F8F8" }}>
              Continue as guest (history won't be saved)
            </Link>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};
 
export default Signup;