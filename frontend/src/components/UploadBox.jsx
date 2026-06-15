import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
 
/*
PROPS:
onFileSelect(file) → called when user drops or selects a file 
*/
 
const UploadBox = ({ onFileSelect }) => {
 
  const onDrop = useCallback((acceptedFiles) => {
    onFileSelect(acceptedFiles[0]); // this line is basically to pass the first file to parent(Home Page) 
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {"image/jpeg": [], "image/png": []}, maxFiles: 1 })
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      {...getRootProps()}
      className="relative cursor-pointer rounded-2xl p-12 flex flex-col items-center justify-center gap-4 transition-all duration-300"
      style={{
        border: isDragActive
          ? "2px dashed #6366F1"
          : "2px dashed rgba(255, 255, 255, 0.08)",
        background: isDragActive
          ? "rgba(99, 102, 241, 0.06)"
          : "rgba(255, 255, 255, 0.04)",
        minHeight: "280px",
        transform: isDragActive ? "scale(1.01)" : "scale(1)",
      }}
    >
      <input {...getInputProps()} />
 
      {/* Upload Icon */}
      <div
        className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: "rgba(99, 102, 241, 0.12)", border: "1px solid rgba(99, 102, 241, 0.24)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
 
      <div className="relative z-10 text-center">
        <p className="font-medium mb-1" style={{ color: "#F8F8F8" }}>
          {isDragActive ? "Drop X-ray here" : "Drop chest X-ray here"}
        </p>
        <p className="text-sm" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
          or click to browse · JPEG, PNG supported
        </p>
      </div>
    </motion.div>
  );
};
 
export default UploadBox;