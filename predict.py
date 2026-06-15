from pathlib import Path
import os
import numpy as np
import base64 
import cv2
import warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
warnings.filterwarnings('ignore')
import tensorflow as tf
tf.get_logger().setLevel('ERROR')
from tensorflow.keras import models
from tensorflow.keras.applications.densenet import preprocess_input
import src.explain as exp

model=None

def load_model():
    global model
    model_path = Path(__file__).resolve().parent / 'model' / 'densenet_v1.keras'
    model=tf.keras.models.load_model(model_path)

def predict(image):
    densenet_base = model.get_layer("densenet121")
    last_layer = "conv5_block16_1_conv"
    
    # Convert PIL to numpy first
    img_array = np.array(image.convert("RGB")).astype("float32")
    
    # Use TF resize like training did
    img_tensor = tf.image.resize(img_array, (224, 224))
    org_img = img_tensor.numpy() / 255.0
    
    # Add batch dimension
    img_tensor = tf.expand_dims(img_tensor, axis=0)
    
    # For model prediction — no preprocessing, model handles internally
    prob = float(model.predict(img_tensor)[0][0])
    label = "Pneumonia" if prob > 0.6 else "Normal"
    
    # For gradcam — needs explicit preprocessing
    img_tensor_preprocessed = preprocess_input(tf.cast(img_tensor, tf.float32))
    
    heatmap = exp.get_heatmap(model, img_tensor_preprocessed, last_layer, densenet_base)
    over_img = exp.overlay(org_img, heatmap)
    
    _, buffer = cv2.imencode('.jpg', cv2.cvtColor(over_img, cv2.COLOR_RGB2BGR))
    heatmap_str = base64.b64encode(buffer).decode('utf-8')
    
    return label, prob, heatmap_str