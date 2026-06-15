import { useState, useEffect } from "react";
import { motion } from "framer-motion";
 
/* 
PROPS:
 file → the File object from UploadBox
*/

const ImagePreview = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(()=>{
     const url =URL.createObjectURL(file)
     setPreviewUrl(url)
     return () => URL.revokeObjectURL(url)
  }, [file]);

  const fileName = file?.name || "xray.jpeg";
  const fileSize = file?.size ? (file.size / 1024).toFixed(1) + " KB" : "";
 
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl overflow-hidden"
      style={{
        border: "1px solid rgba(255, 255, 255, 0.08)",
        background: "rgba(255, 255, 255, 0.04)",
      }}
    >
      {/* Image area */}
      <div className="relative flex items-center justify-center" style={{ minHeight: "240px", background: "#0A0A0A" }}>
          <img
            src={previewUrl}
            alt="Uploaded X-ray preview"
            className="max-h-64 object-contain"
          />
      </div>
 
      {/* File info bar */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: "#6366F1" }} />
          <span className="text-sm font-medium" style={{ color: "#F8F8F8" }}>
            {fileName}
          </span>
        </div>
        <span className="text-xs" style={{ color: "rgba(255, 255, 255, 0.35)" }}>
          {fileSize}
        </span>
      </div>
    </motion.div>
  );
};
 
export default ImagePreview;