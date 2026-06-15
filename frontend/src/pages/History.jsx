import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import Layout from "../components/Layout";
import HistoryCard from "../components/HistoryCard";
import { toBase64 } from "../utils/toBase64";
import {handleDownload} from "../utils/docFile";
 
const History = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewRecord, setViewRecord] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState(new Set());
 
  // auth check using token stored in localStorage
  const token = localStorage.getItem("token")
  const isLoggedIn = !!token;

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    async function fetchHistory() {
      const res = await fetch("http://localhost:8000/history", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setRecords(data)
      setLoading(false)
    }
    fetchHistory()
  }, [isLoggedIn]);
 
  const handleView = (record) => {
    setViewRecord(record);
  };
 

  const handleDelete = async (record) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    const res = await fetch(`http://localhost:8000/history/${record._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setRecords(records.filter((r) => r._id !== record._id));
    }else {
      alert("Failed to delete record. Please try again.")
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedRecords(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Delete ${selectedRecords.size} records?`)) return
    const res = await fetch("http://localhost:8000/history", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ record_ids: Array.from(selectedRecords) })
    })
    if (res.ok) {
      setRecords(records.filter(r => !selectedRecords.has(r._id)))
      setSelectedRecords(new Set())
    }
  };

  return (
    <Layout navVariant="home">
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
 
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-1 tracking-tight">
            Scan History
          </h2>
          <p className="text-sm" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
            Your past X-ray analyses and results
          </p>
        </motion.div>
 
        {/* Not logged in state */}
        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4 text-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
              style={{ background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.18)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F8F8F8" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <p className="font-medium" style={{ color: "#E2E8F0" }}>Login to view history</p>
            <p className="text-sm" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
              Create an account to save and revisit your past scans
            </p>
            <div className="flex gap-3 mt-2">
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: "rgba(99, 102, 241, 0.12)",
                  border: "1px solid rgba(99, 102, 241, 0.28)",
                  color: "#F8F8F8",
                }}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ border: "1px solid rgba(255, 255, 255, 0.08)", color: "#F8F8F8" }}
              >
                Sign Up
              </Link>
            </div>
          </motion.div>
        )}
 
        {/* Loading state */}
        {isLoggedIn && loading && (
          <div className="flex justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 rounded-full"
              style={{ border: "2px solid rgba(255, 255, 255, 0.08)", borderTopColor: "#6366F1" }}
            />
          </div>
        )}
 
        {/* Empty state */}
        {isLoggedIn && !loading && records.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p className="text-sm mb-2" style={{ color: "rgba(255, 255, 255, 0.5)" }}>No scans yet</p>
            <Link to="/home" className="text-sm" style={{ color: "#F8F8F8" }}>
              Upload your first X-ray →
            </Link>
          </motion.div>
        )}

        {selectedRecords.size > 0 && (
        <div className="flex justify-end mb-3">
          <button
            onClick={handleDeleteSelected}
            className="text-xs px-4 py-2 rounded-lg transition-all duration-200"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "rgba(255, 255, 255, 0.55)"
            }}
          >
            Delete Selected ({selectedRecords.size})
          </button>
        </div>
        )}
 
        {/* Records list */}
        {isLoggedIn && !loading && records.length > 0 && (
          <div className="space-y-3">
            {records.map((record, i) => (
              <HistoryCard
                key={record._id || i}
                record={record}
                index={i}
                onView={handleView}
                onDownload={handleDownload}
                onDelete={handleDelete}
                isSelected={selectedRecords.has(record._id)}
                onToggleSelect={handleToggleSelect}
              />
            ))}
          </div>
        )}
 
      </div>

      {/* View Modal */}
      {viewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setViewRecord(null)}
        >
          <div className="rounded-2xl p-6 max-w-sm w-full mx-4"
            style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
            onClick={e => e.stopPropagation()}
          >
            <p style={{ color: "#F8F8F8" }} className="font-bold text-lg mb-1">{viewRecord.label}</p>
            <p className="text-sm mb-4" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
              Confidence: {Math.round(viewRecord.probability * 100)}%
            </p>
            <img src={`data:image/png;base64,${viewRecord.heatmap}`} className="w-full rounded-xl mb-4" alt="Grad-CAM heatmap" />
            <button onClick={() => setViewRecord(null)} className="text-xs"
              style={{ color: "rgba(255, 255, 255, 0.5)" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};
 
export default History;