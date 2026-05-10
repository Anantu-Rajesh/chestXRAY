import os
import warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
warnings.filterwarnings('ignore')
import numpy as np
import cv2
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras.applications.densenet import preprocess_input
from tensorflow.keras import models
tf.get_logger().setLevel('ERROR')
import src.config as config

def get_img(filepath):
    image = tf.io.read_file(filepath)
    image = tf.image.decode_jpeg(image, channels=3)
    ''' For Testing
    plt.imshow(image.numpy().astype('uint8'))
    plt.axis('off')
    plt.show()'''
    image = tf.image.resize(image, config.img_size)

    org_img=image/255.0

    image=tf.expand_dims(image, axis=0)  
    image=preprocess_input(image)
    return image,org_img

def get_heatmap(model,image,last_layer,densenet_base):
    grad_model=tf.keras.models.Model(densenet_base.inputs, [densenet_base.get_layer(last_layer).output, densenet_base.output])
    with tf.GradientTape() as tape:
        last_output,base_output=grad_model(image)
        tape.watch(last_output)
        x = model.get_layer("global_average_pooling2d")(base_output)
        x = model.get_layer("dropout")(x)
        x = model.get_layer("dense")(x)
        x = model.get_layer("dropout_1")(x)
        pred = model.get_layer("dense_1")(x)
        class_channel=pred[:,0]
    grads=tape.gradient(class_channel,last_output)
    pooled_grads=tf.reduce_mean(grads,axis=(0,1,2))
    
    last_output=last_output[0]
    heatmap=last_output@pooled_grads[...,tf.newaxis]
    heatmap=tf.squeeze(heatmap)
    heatmap=tf.maximum(heatmap,0)/tf.math.reduce_max(heatmap)
    return heatmap.numpy()

def overlay(image,heatmap,alpha=0.4):
    heatmap_resized = cv2.resize(heatmap, (image.shape[1], image.shape[0]))
    
    heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

    superimposed = heatmap_colored * alpha + (image.numpy() * 255) * (1 - alpha)
    superimposed = np.uint8(superimposed)
    
    return superimposed

