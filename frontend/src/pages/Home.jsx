import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout";
import UploadBox from "../components/UploadBox";
import ImagePreview from "../components/ImagePreview";
import ResultCard from "../components/ResultCard";
import { toBase64 } from "../utils/toBase64";

/*
 STATUS FLOW: "idle" → "uploaded" → "processing" → "result"

 STATES:
 file     → the uploaded File object
 status   → current step in flow
 result   → {label, probability, heatmap} from backend
 error    → string if something goes wrong
*/

const Home = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); 
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null)
  const [originalBase64, setOriginalBase64] = useState(null)

  const handleFileSelect = (selectedFile) => {
    const url = URL.createObjectURL(selectedFile)
    setFile(selectedFile)
    setPreviewUrl(url)
    toBase64(url).then(setOriginalBase64)
    setStatus("uploaded")
  };
 
  const handleAnalyze = async () => {
    setStatus("processing")

    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("http://localhost:8000/predict", { method: "POST", body: formData })
    
    if(res.ok){
      const data = await res.json()
      setResult(data)
      setStatus("result")
      const token = localStorage.getItem("token")
      if(token){
        await fetch("http://localhost:8000/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            label: data.label,
            probability: data.probability,
            heatmap: data.heatmap,
            original_image: originalBase64
          })
        })
      }
    } else {
      setError("Analysis failed. Please try again.")
      setStatus("uploaded")
    }
  };
 
  const handleReset = () => {
    setFile(null)
    setStatus("idle")
    setResult(null)
    setError(null)
    setOriginalBase64(null)
  };
 
  return (
    <Layout navVariant="home">
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
 
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-1 tracking-tight">
            Chest X-Ray Analysis
          </h2>
          <p className="text-sm" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
            Upload an X-ray to detect pneumonia 
          </p>
        </motion.div>
 
        {/* Status indicator */}
        <div className="flex items-center gap-2 mb-6">
          {["idle", "uploaded", "processing", "result"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: status === step ? "#6366F1"
                    : ["idle", "uploaded", "processing", "result"].indexOf(status) > i
                      ? "rgba(99, 102, 241, 0.45)"
                      : "rgba(255, 255, 255, 0.08)",
                }}
              />
              {i < 3 && (
                <div className="w-6 h-px" style={{ background: "rgba(255, 255, 255, 0.08)" }} />
              )}
            </div>
          ))}
          <span className="text-xs ml-2 capitalize" style={{ color: "rgba(255, 255, 255, 0.35)" }}>
            {status === "idle" ? "waiting for upload"
              : status === "uploaded" ? "ready to analyze"
              : status === "processing" ? "analyzing..."
              : "complete"}
          </span>
        </div>
 
        {/* Main content area */}
        <AnimatePresence mode="wait">
 
          {/* IDLE: show upload box */}
          {status === "idle" && (
            <motion.div key="idle" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <UploadBox onFileSelect={handleFileSelect} />
            </motion.div>
          )}
 
          {/* UPLOAD: show preview + analyze button */}
          {status === "uploaded" && (
            <motion.div key="uploaded" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ImagePreview file={file} previewUrl={previewUrl} />
 
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAnalyze}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: "rgba(99, 102, 241, 0.12)",
                    border: "1px solid rgba(99, 102, 241, 0.28)",
                    color: "#F8F8F8",
                  }}
                >
                  Analyze X-Ray
                </button>
                <button
                  onClick={handleReset}
                  className="px-5 py-3 rounded-xl text-sm transition-all duration-200"
                  style={{ border: "1px solid rgba(255, 255, 255, 0.08)", color: "rgba(255, 255, 255, 0.5)" }}
                >
                  Remove
                </button>
              </div>
            </motion.div>
          )}
 
          {/* PROCESSING: spinner */}
          {status === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-6"
            >
              <div className="relative w-20 h-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full"
                  style={{ border: "2px solid rgba(255, 255, 255, 0.08)", borderTopColor: "#6366F1" }}
                />
              </div>
 
              <div className="text-center">
                <p className="text-sm font-medium mb-1" style={{ color: "#F8F8F8" }}>Analyzing lung patterns</p>
                <p className="text-xs" style={{ color: "rgba(255, 255, 255, 0.35)" }}>Running DenseNet121 + Grad-CAM</p>
              </div>
            </motion.div>
          )}
 
          {/* RESULT */}
          {status === "result" && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ResultCard
                label={result.label}
                probability={result.probability}
                heatmap={result.heatmap}
                originalImage={previewUrl}
                onReset={handleReset}
              />
            </motion.div>
          )}
 
        </AnimatePresence>
 
        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}
          >
            {error}
          </motion.div>
        )}
 
      </div>
    </Layout>
  );
};
 
export default Home;