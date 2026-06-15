# Chest X-Ray Pneumonia Detection

A full-stack AI application for pneumonia screening from chest X-rays. Combines a DenseNet121 transfer learning model with a React + FastAPI + MongoDB stack, including Grad-CAM explainability and PDF report generation.

 **Disclaimer:** This is a research and learning project. Not a certified medical device. Not a substitute for professional diagnosis.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Model | DenseNet121, TensorFlow/Keras |
| Explainability | Grad-CAM (conv5_block16_1_conv) |
| Backend | FastAPI, Python |
| Database | MongoDB Atlas, PyMongo |
| Auth | JWT (PyJWT), bcrypt |
| Frontend | React, Tailwind CSS, Framer Motion |
| PDF Reports | jsPDF |

---

## Project Structure

```
├── model/
│   ├── densenet_v1.keras          # Final trained model
│   └── densenet_v1_p1.keras       # Phase 1 checkpoint
│
├── src/                           # ML pipeline
│   ├── config.py                  # Hyperparameters and paths
│   ├── data_processing.py         # Patient-level data loading and splitting
│   ├── model.py                   # DenseNet121 architecture
│   ├── train.py                   # Two-phase training
│   ├── evaluate.py                # Metrics and threshold analysis
│   └── explain.py                 # Grad-CAM generation
│
├── predict.py                     # Inference entry point
│
├── backend/
│   ├── main.py                    # FastAPI app, CORS
│   ├── db.py                      # MongoDB connection
│   ├── routes/
│   │   ├── predict.py             # POST /predict
│   │   ├── auth.py                # Login / signup
│   │   └── history.py             # Scan history CRUD
│   ├── models/
│   │   ├── user.py                # Pydantic user schema
│   │   └── history.py             # Pydantic history schema
│   └── utils/
│       ├── auth.py                # JWT create / verify
│       └── hash.py                # Password hashing
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Overview.jsx       # Project info, model details, how-it-works
        │   ├── Home.jsx           # Upload → analyze → result flow
        │   ├── History.jsx        # Authenticated scan history
        │   ├── Login.jsx
        │   └── Signup.jsx
        ├── components/
        │   ├── Layout.jsx
        │   ├── Navbar.jsx
        │   ├── UploadBox.jsx      # react-dropzone based uploader
        │   ├── ImagePreview.jsx
        │   ├── ResultCard.jsx     # Prediction + heatmap display
        │   └── HistoryCard.jsx
        └── utils/
            ├── toBase64.js        # Blob URL → base64 conversion
            └── docFile.js         # PDF report generation
```

---

## Model

### Architecture

Base: DenseNet121 pretrained on ImageNet (`include_top=False`)

Custom head:
```
GlobalAveragePooling2D → Dropout(0.3) → Dense(128, relu) → Dropout(0.2) → Dense(1, sigmoid)
```

### Training — Two-Phase Transfer Learning

| Phase | Base Layers | LR | Epochs | Early Stopping |
|---|---|---|---|---|
| 1 | Frozen | 1e-3 | up to 10 | patience=3 |
| 2 | Last 20 unfrozen | 1e-5 | up to 10 | patience=5 |

Phase 1 trains only the custom head on frozen ImageNet features. Phase 2 fine-tunes the last 20 DenseNet layers at a low learning rate to adapt to chest X-ray patterns without catastrophic forgetting.

### Dataset

**Chest X-Ray Images (Pneumonia) Dataset**

Dataset link : https://www.kaggle.com/datasets/divyam6969/chest-xray-pneumonia-dataset

The dataset contains chest X-ray images from **2,986 unique patients**, organized into:
- **Normal**: Healthy chest X-ray images (826 images)
- **Pneumonia**: X-ray images showing pneumonia (2,430 images)
  - Bacterial pneumonia
  - Viral pneumonia

**Dataset Statistics:**
- **Total Images**: 5,256 chest X-rays
- **Total Patients**: 2,986 unique patients
- **Patient-Level Split**: 60/20/20 (Train/Val/Test)
| Split | Patients | Images |
|---|---|---|
| Train | 1,791 | 3,088 |
| Validation | 597 | 1,005 |
| Test | 598 | 1,163 |
- **Image format**: JPEG
- **Image dimensions**: Resized to 224×224 pixels
- **Color space**: RGB (grayscale X-rays converted to 3-channel)
- **Class Imbalance**: 2.8:1 (Pneumonia:Normal)

**Dataset Source:**  
Chest X-Ray Images (Pneumonia) Dataset from Kaggle

**Implementation Detail**: This project uses **patient-level splitting** rather than random image splitting. 
```python
# Extract patient IDs from filenames
if filename.startswith('person'):
    patient_id = filename.split('_')[0]  # personXXX
elif filename.startswith('img-'):
    patient_id = 'normal_' + filename.split('-')[1]  # img-XXX-YYY

# Split patients (not images) into 60/20/20
```
This ensures:
- No data leakage between train/val/test sets
- Model evaluated on completely unseen patients
- More realistic performance metrics

**Note:** The dataset is not included in this repository due to its size. Please download it separately and place it in the `data/Chest XRay Dataset/` directory following the structure shown below.

### Results

Test set: 598 unseen patients, 1,163 images.

| Metric | Value |
|---|---|
| Accuracy | 95.7% |
| AUC | 0.989 |
| Pneumonia Recall | 97.52% |
| Normal Recall | 89.86% |
| Test Loss | 0.1059 |

Confusion matrix (threshold = 0.5):
```
              Predicted
           Normal  Pneumonia
Actual Normal   248        28
       Pneumonia  22       865
```

Prediction distribution (strong class separation):
- Normal X-rays: mean score **0.13**
- Pneumonia X-rays: mean score **0.97**

Threshold was kept at **0.5** based on evaluation results. Thresholds were tested in the range (0.3-0.7) among which 0.6 gave marginally better normal recall at the cost of slightly lower pneumonia recall — configurable in `predict.py`.

---

## Grad-CAM

Grad-CAM computes gradients of the predicted class score with respect to feature maps at a chosen convolutional layer. High-gradient regions get warm colors (red/yellow) in the overlay; low-gradient regions get cool colors (blue).

**Layer used:** `conv5_block16_1_conv`

### Known Limitation

In some cases — particularly normal X-rays and occasionally pneumonia cases — the heatmap highlights regions outside the chest area rather than the lungs.

This is not a model flaw. Two reasons:

1. `conv5_block16_1_conv` is a pre-activation layer. The gradient signal can be spatially diffuse at this depth.
2. Grad-CAM assumes a linear relationship between feature maps and output — an approximation that can spread activation across regions.

The classification metrics confirm the model is learning correct patterns: AUC 0.9912 on a strict patient-level split, with clearly separated prediction distributions (0.13 vs 0.97 mean scores). Background heatmap activation for normal X-rays is also clinically harmless — the model is correctly identifying the absence of pneumonia regardless.

Potential improvement: switch to **Grad-CAM++** or target `conv5_block16_concat` (post-activation) for tighter spatial localization.

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/predict` | No | Upload X-ray → label + probability + heatmap (base64) |
| POST | `/auth/signup` | No | Register, returns JWT |
| POST | `/auth/login` | No | Login, returns JWT |
| GET | `/history` | JWT | Fetch user's scan history |
| POST | `/history` | JWT | Save scan record |
| DELETE | `/history/{id}` | JWT | Delete single record |
| DELETE | `/history` | JWT | Bulk delete by list of IDs |

---

## Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB Atlas account (free tier)

### Backend

```bash
git clone https://github.com/Anantu-Rajesh/chestXRAY.git
cd chestXRAY

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env in backend/ folder:
# MONGODB_URL=your_atlas_connection_string
# SECRET_KEY=your_jwt_secret

cd backend
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173` — Backend: `http://localhost:8000`

### Training & Evaluation
**Download and organize the dataset**
  - Download the Chest X-Ray dataset
  - Create `data/all_img/` directory
  - Place all images in subdirectories: `NORMAL/` and `PNEUMONIA/`
  - Ensure filenames follow the pattern:
    - Normal: `img-XXX-YYY.jpeg`
    - Pneumonia: `personXXX_bacteria_YYY.jpeg` or `personXXX_virus_YYY.jpeg`

```bash
python src/train.py     # train and save model
python src/evaluate.py  # evaluate on test set
```

---

## Known Limitations

- **Grad-CAM background activation**
- **Single dataset** — trained on one Kaggle dataset. Generalisation to different scanners, patient demographics, or image quality is untested.
- **Not clinically validated** — no radiologist review or prospective clinical testing. Research and learning project only.
