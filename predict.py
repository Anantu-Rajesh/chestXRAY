import os
import warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
warnings.filterwarnings('ignore')
import tensorflow as tf
tf.get_logger().setLevel('ERROR')
from tensorflow.keras import models
import src.explain as exp

model=None

def load_model():
    global model
    model=tf.keras.models.load_model('model/densenet_v1.keras')

def predict(filepath):
    densenet_base = model.get_layer("densenet121")
    last_layer= "conv5_block16_2_conv"
    image,org_img = exp.get_img(filepath)
    logits = model.predict(image)[0][0]
    prob = tf.sigmoid(logits).numpy()
    label = "Pneumonia" if prob > 0.5 else "Normal"
    heatmap = exp.get_heatmap(model, image, last_layer, densenet_base)
    over_img=exp.overlay(org_img, heatmap)
    return label, prob, over_img