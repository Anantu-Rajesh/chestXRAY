import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
 
const userSteps = [
  {
    number: "01",
    title: "Upload a chest X-ray image",
    desc: "Choose a JPEG or PNG file from your device",
  },
  {
    number: "02",
    title: "Click Analyze",
    desc: "The result appears in a few seconds",
  },
  {
    number: "03",
    title: "View and save the result",
    desc: "See the prediction, heatmap, download the report or store it in history.",
  },
];

const technicalPoints = [
  "X-ray images were split at the patient level so images from the same person never leaked across train, validation, and test sets.",
  "Training used two phases: a frozen DenseNet121 base at learning rate 1e-3, then fine-tuning the last 20 layers at 1e-5.",
  "Class imbalance was handled with class weights so Normal and Pneumonia examples contributed more evenly during training.",
  "The model was evaluated on metrics: accuracy, recall, AUC, confusion matrix, and threshold checks on unseen patients.",
  "Grad-CAM is generated from the last convolution block, conv5_block16_1_conv, to show the regions that influenced the prediction.",
];
 
const Overview = () => {
  return (
    <Layout navVariant="overview">
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
 
        {/* Hero */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight">
              Chest X-ray pneumonia detection
            </h1>
 
            <p className="text-md mb-10 max-w-xl mx-auto" style={{ color: "rgba(255, 255, 255, 0.5)", lineHeight: "1.7" }}>
              Classifies chest X-rays as normal or pneumonia using DenseNet121 with transfer learning & Grad-CAM visualization showing which regions influenced the prediction.
            </p>
 
            <Link
              to="/home"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-medium text-sm transition-all duration-200"
              style={{
                background: "rgba(99, 102, 241, 0.12)",
                border: "1px solid rgba(99, 102, 241, 0.28)",
                color: "#F8F8F8",
              }}
            >
              Open Scanner
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
 
        {/* How to use */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-20"
        >
          <p className="text-xs uppercase tracking-widest mb-8 text-center"
            style={{ color: "rgba(255, 255, 255, 0.35)", letterSpacing: "0.2em" }}
          >
            How to use
          </p>

          <div className="grid grid-cols-3 gap-4">
            {userSteps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.1 }}
                className="rounded-xl p-5"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono" style={{ color: "rgba(255, 255, 255, 0.35)" }}>
                    {step.number}
                  </span>
                </div>
                <p className="font-medium text-sm mb-1.5" style={{ color: "#F8F8F8" }}>{step.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255, 255, 255, 0.5)" }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <p className="mt-6 text-xs text-center max-w-xl mx-auto" style={{ color: "rgba(255, 255, 255, 0.35)", lineHeight: "1.6" }}>
            NOTE: the predictions can be stored in history only after account creation and login
          </p>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-20"
        >
          <p className="text-xs uppercase tracking-widest mb-8 text-center"
            style={{ color: "rgba(255, 255, 255, 0.35)", letterSpacing: "0.2em" }}
          >
            Training details
          </p>

          <div className="rounded-xl p-5"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="space-y-3">
              {technicalPoints.map((point) => (
                <div key={point} className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "#6366F1" }} />
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <p className="text-xs uppercase tracking-widest mb-8 text-center"
            style={{ color: "rgba(255, 255, 255, 0.35)", letterSpacing: "0.2em" }}>
            Model Metrics
        </p>
        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-24"
        >
          
          {[
            { value: "95.7%", label: "Accuracy" },
            { value: "0.989", label: "AUC Score" },
            { value: "2,986", label: "Patients trained on" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center rounded-xl py-6"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <p className="text-xs mb-1" style={{ color: "rgba(255, 255, 255, 0.35)" }}>{stat.label}</p>
              <p className="text-2xl font-bold mb-1" style={{ color: "#F8F8F8" }}>{stat.value}</p>
            </div>
          ))}
        </motion.div>
 
        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-md mt-16"
          style={{ color: "rgba(255, 255, 255, 0.35)" }}
        >
          This is an AI-assisted tool and not a substitute for professional medical diagnosis.
        </motion.p>
      </div>
    </Layout>
  );
};
 
export default Overview;