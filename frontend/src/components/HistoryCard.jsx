import { motion } from "framer-motion";
 
/*
PROPS:
 record → { id, label, probability, timestamp, image_url, heatmap_url }
 onView(record) → called when View button clicked
 onDownload(record) → called when Download button clicked
*/
 
const HistoryCard = ({ record, onView, onDownload, index, onDelete,isSelected,onToggleSelect }) => {
  const isPneumonia = record?.label === "Pneumonia";
  const confidencePct = Math.round((record?.probability || 0) * 100);
 
  // timestamp formatting
  const formattedDate = record.created_at 
  ? new Date(record.created_at).toLocaleDateString("en-IN", {
      year: "numeric", month: "long", day: "numeric"
    })
  : "Unknown date"
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="rounded-xl p-4 flex items-center gap-4 transition-all duration-200"
      style={{
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)"}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelect?.(record._id)}
        className="shrink-0 cursor-pointer"
        style={{ accentColor: "#6366F1", width: "14px", height: "14px" }}
      />
      
      {/* Thumbnail */}
      <div
        className="w-14 h-14 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
        style={{ background: "#0A0A0A", border: "1px solid rgba(255, 255, 255, 0.08)" }}
      >
        {record?.image_url ? (
          <img src={record.image_url} alt="X-ray thumbnail" className="w-full h-full object-cover" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        )}
      </div>
 
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: isPneumonia ? "rgba(239, 68, 68, 0.12)" : "rgba(34, 197, 94, 0.12)",
              color: isPneumonia ? "#F87171" : "#4ADE80",
              border: `1px solid ${isPneumonia ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
            }}
          >
            {record?.label || "Unknown"}
          </span>
          <span className="text-xs" style={{ color: "rgba(255, 255, 255, 0.35)" }}>
            {confidencePct}% confidence
          </span>
        </div>
        <p className="text-xs truncate" style={{ color: "rgba(255, 255, 255, 0.35)" }}>
          {formattedDate}
        </p>
      </div>
 
      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onView?.(record)}
          className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
          style={{
            background: "rgba(99, 102, 241, 0.12)",
            border: "1px solid rgba(99, 102, 241, 0.24)",
            color: "#6366F1",
          }}
        >
          View
        </button>
        <button
          onClick={() => onDownload?.(record)}
          className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
          style={{
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "rgba(255, 255, 255, 0.5)",
          }}
        >
          Download
        </button>
        <button
          onClick={() => onDelete?.(record)}
          className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
          style={{
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "rgba(255, 255, 255, 0.5)",
          }}
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
};
 
export default HistoryCard;