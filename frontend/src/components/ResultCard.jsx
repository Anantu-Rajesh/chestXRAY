import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import { toBase64 } from "../utils/toBase64";
import {handleDownload} from "../utils/docFile";
import { useState, useEffect } from "react";
 
/*
PROPS:
 label      → "Pneumonia" or "Normal"
 probability → float e.g. 0.87
 heatmap    → base64 string from backend (the gradcam overlay image)
 originalImage → URL of the original uploaded image (for PDF generation)
 onReset() → callback to trigger new scan (reset state in parent Home.jsx)
*/
 
const ResultCard = ({ label, probability, heatmap, originalImage, onReset }) => {
  const isPneumonia = label === "Pneumonia";
  const [displayCount, setDisplayCount] = useState(0)
  const confidencePct = Math.round((probability || 0) * 100);
 
  const confidenceLabel =
    confidencePct >= 85 ? "High confidence" :
    confidencePct >= 65 ? "Moderate confidence" :
    "Low confidence";
  
  useEffect(() => {
    let start = 0
    const timer = setInterval(() => {
      start += 2
      if (start >= confidencePct) {
        setDisplayCount(confidencePct)
        clearInterval(timer)
      } else {
        setDisplayCount(start)
      }
    }, 20)
    return () => clearInterval(timer)
  }, [confidencePct]);

 
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Result banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl px-5 py-4 flex items-center justify-between"
        style={{
          background: isPneumonia
            ? "rgba(239, 68, 68, 0.08)"
            : "rgba(34, 197, 94, 0.08)",
          border: `1px solid ${isPneumonia ? "rgba(239, 68, 68, 0.18)" : "rgba(34, 197, 94, 0.18)"}`,
        }}
      >
        <div>
          <p className="text-xs mb-1" style={{ color: "rgba(255, 255, 255, 0.35)" }}>
            Detection Result
          </p>
          <p
            className="text-2xl font-bold tracking-tight"
            style={{ color: isPneumonia ? "#F87171" : "#4ADE80" }}
          >
            {label}
          </p>
        </div>
 
        {/* Confidence score */}
        <div className="text-right">
          <p
            className="text-3xl font-bold"
            style={{ color: isPneumonia ? "#F87171" : "#4ADE80" }}
          >
            {displayCount}%
          </p>
          <p className="text-xs" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
            {confidenceLabel}
          </p>
        </div>
      </motion.div>
 
      {/* Images side by side */}
      <div className="grid grid-cols-2 gap-3">
        {/* Original image */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255, 255, 255, 0.08)", background: "#0A0A0A" }}
        >
          <div className="px-3 py-2" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <p className="text-xs" style={{ color: "rgba(255, 255, 255, 0.35)" }}>Original X-Ray</p>
          </div>
          <div className="flex items-center justify-center p-2" style={{ minHeight: "180px" }}>
            {originalImage ? (
              <img src={originalImage} alt="Original X-ray" className="max-h-40 object-contain" />
            ) : null}
          </div>
        </motion.div>
 
        {/* Grad-CAM heatmap */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255, 255, 255, 0.08)", background: "#0A0A0A" }}
        >
          <div className="px-3 py-2" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <p className="text-xs" style={{ color: "rgba(255, 255, 255, 0.35)" }}>Grad-CAM Heatmap</p>
          </div>
          <div className="flex items-center justify-center p-2" style={{ minHeight: "180px" }}>
            {heatmap ? (
              <img
                src={`data:image/png;base64,${heatmap}`}
                alt="Grad-CAM heatmap"
                className="max-h-40 object-contain"
              />
            ) : (
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>heatmap loading</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-3"
      >
        {/* PDF download */}
        <button className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200" style={{background: "rgba(99, 102, 241, 0.12)",border: "1px solid rgba(99, 102, 241, 0.28)",color: "#6366F1"}}
          onClick={async() => {
            const originalBase64 = originalImage ? await toBase64(originalImage) : null;
            handleDownload({ original_image: originalImage, heatmap: heatmap, label: label, probability: confidencePct / 100, created_at: new Date().toISOString(), _id: null });
          }}
        >
          Download Report
        </button>
 
        <button
          className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "rgba(255, 255, 255, 0.5)",
          }}
          onClick={onReset}
        >
          Scan Another
        </button>
      </motion.div>
 
      {/* Disclaimer */}
      <p className="text-xs text-center" style={{ color: "rgba(255, 255, 255, 0.35)" }}>
        This is an AI-assisted tool and not a substitute for professional medical diagnosis.
      </p>
    </motion.div>
  );
};
 
export default ResultCard;