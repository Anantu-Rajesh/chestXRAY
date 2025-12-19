# Chest X-Ray Pneumonia Detection using Deep Learning

A deep learning-based medical image classification system for detecting pneumonia in chest X-ray images. This project implements a Convolutional Neural Network (CNN) to distinguish between normal and pneumonia cases, including bacterial and viral pneumonia subtypes.

## 📊 Dataset

**Chest X-Ray Images (Pneumonia) Dataset**

The dataset is organized into three folders (train, test, val) containing subfolders for each image category:
- **Normal**: Healthy chest X-ray images
- **Pneumonia**: X-ray images showing pneumonia
  - Bacterial pneumonia
  - Viral pneumonia

**Dataset Statistics:**
- Training images with 80-20 train-validation split
- Separate test set for evaluation
- Image format: JPEG
- Image dimensions: Resized to 224×224 pixels
- Color space: RGB (grayscale X-rays converted to 3-channel)

**Dataset Source:**  
This dataset contains chest X-ray images for pneumonia detection and classification tasks.

> **Note:** The dataset is not included in this repository due to its size. Please download it separately and place it in the `data/Chest XRay Dataset/` directory following the structure shown below.

## 🏗️ Project Structure

```
Chest XRAY Project/
├── data/
│   └── Chest XRay Dataset/
│       ├── train/
│       │   ├── NORMAL/
│       │   └── PNEUMONIA/
│       │       ├── BACTERIAL/
│       │       └── VIRAL/
│       └── test/
│           ├── NORMAL/
│           └── PNEUMONIA/
│               ├── BACTERIAL/
│               └── VIRAL/
├── model/
│   └── final_model.h5
├── src/
│   ├── config.py           # Configuration and hyperparameters
│   ├── data_processing.py  # Data loading and preprocessing
│   ├── model.py           # Model architecture
│   ├── train.py           # Training script
│   ├── evaluate.py        # Model evaluation
│   └── explain.py         # Model interpretability
├── gpu_test.py            # GPU availability test
├── requirements.txt       # Python dependencies
└── README.md
```

## 🚀 Features

### Data Processing Pipeline
- **Automated Data Loading**: Loads images from directory structure with automatic label inference
- **Train-Validation Split**: 80-20 split for model training and validation
- **Data Augmentation**: Prevents overfitting through:
  - Random rotation (±5 degrees)
  - Random zoom (10%)
  - Random translation (5% shift)
- **Normalization**: Pixel value scaling from [0, 255] to [0, 1]
- **Class Imbalance Handling**: Calculated class weights to address dataset imbalance

### Model Architecture
- **Input Size**: 224×224×3 (compatible with pre-trained models)
- **Batch Size**: 32
- **Training Epochs**: 10
- **Class Balancing**: Weighted loss function to handle class imbalance

### Visualization
- Sample image visualization from training set
- Class distribution analysis
- Training/validation metrics plotting

## 🛠️ Technologies Used

- **Python 3.x**
- **TensorFlow 2.10.1**: Deep learning framework
- **Keras**: High-level neural network API
- **NumPy**: Numerical computations
- **Pandas**: Data manipulation
- **Matplotlib**: Data visualization
- **Scikit-learn**: Machine learning utilities
- **Pillow**: Image processing

## 📋 Prerequisites

### Hardware Requirements
- **GPU (Recommended)**: CUDA-compatible GPU for faster training
  - Note: TensorFlow 2.10+ removed native Windows CUDA support
  - For GPU acceleration on Windows: Use WSL2 or TensorFlow 2.10 with Python 3.10
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: ~5GB for dataset and models

### Software Requirements
- Python 3.10
- CUDA Toolkit (for GPU support)
- cuDNN (for GPU support)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/Anantu-Rajesh/chestXRAY.git
cd chestXRAY
```

2. **Create a virtual environment (recommended)**
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On Linux/Mac
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Download the dataset**
   - Download the Chest X-Ray dataset
   - Extract and place it in `data/Chest XRay Dataset/` directory
   - Ensure the folder structure matches the project structure shown above

## 🎯 Usage

### 1. Data Preprocessing
```bash
python src/data_processing.py
```
This script will:
- Load the dataset
- Apply data augmentation
- Normalize images
- Calculate class weights
- Display sample images and class distribution

### 2. Train the Model
```bash
python src/train.py
```

### 3. Evaluate the Model
```bash
python src/evaluate.py
```

### 4. Model Interpretation
```bash
python src/explain.py
```

## 📊 Model Configuration

Key hyperparameters can be modified in `src/config.py`:
- `img_size`: Input image dimensions (default: 224×224)
- `batch_size`: Batch size for training (default: 32)
- `epoch`: Number of training epochs (default: 10)
- `validation_split`: Validation split ratio (default: 0.2)

## 🔍 Key Implementation Details

### Data Augmentation Strategy
- **Random Rotation**: ±5° to simulate different X-ray angles
- **Random Zoom**: 10% to handle varying chest sizes
- **Random Translation**: 5% shift to account for positioning variations

### Class Imbalance Handling
```python
class_weight = total_samples / (num_classes × images_in_class)
```
This ensures the minority class (Normal) receives appropriate attention during training.

### Image Preprocessing
- Grayscale X-rays converted to RGB format (3 channels)
- Pixel normalization to [0, 1] range
- Standardized input size of 224×224 pixels

## 📈 Results

*Model performance metrics will be documented after training completion*


## 📝 License

This project is available for educational and research purposes.

## 👤 Author

**Anantu Rajesh**
- GitHub: [@Anantu-Rajesh](https://github.com/Anantu-Rajesh)

## 🙏 Acknowledgments

- Dataset providers for the Chest X-Ray Pneumonia dataset
- TensorFlow and Keras teams for the excellent deep learning frameworks
- Medical imaging research community for insights and best practices

## 📞 Contact

For questions, suggestions, or collaboration opportunities, please open an issue on GitHub.

---

**⚠️ Medical Disclaimer**: This project is for educational and research purposes only. It should not be used as a substitute for professional medical diagnosis or treatment.