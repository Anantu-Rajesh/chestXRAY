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

'''def get_heatmap(model,image,last_layer,densenet_base):
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
    return heatmap.numpy()'''
def get_heatmap(model, image, last_layer, densenet_base):
    image = tf.cast(image, tf.float32)
    grad_model = tf.keras.models.Model(
        densenet_base.inputs, 
        [densenet_base.get_layer(last_layer).output, densenet_base.output]
    )
    
    with tf.GradientTape() as tape:
        tape.watch(image)  # watch input instead
        last_output, base_output = grad_model(image)
        x = model.get_layer("global_average_pooling2d")(base_output)
        x = model.get_layer("dropout")(x, training=False)
        x = model.get_layer("dense")(x)
        x = model.get_layer("dropout_1")(x, training=False)
        pred = model.get_layer("dense_1")(x)
        class_channel = pred[:, 0]
    
    grads = tape.gradient(class_channel, last_output)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    last_output = last_output[0]
    heatmap = last_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    return heatmap.numpy()

def overlay(image,heatmap,alpha=0.4):
    heatmap_resized = cv2.resize(heatmap, (image.shape[1], image.shape[0]))
    
    heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

    superimposed = heatmap_colored * alpha + (image * 255) * (1 - alpha)
    superimposed = np.uint8(superimposed)
    
    return superimposed

if __name__ == "__main__":
    model = tf.keras.models.load_model('model/densenet_v1.keras')
    
    # get image
    image, org_img = get_img(r'data\all_img\PNEUMONIA\VIRAL\person86_virus_159.jpeg')
    
    # get heatmap
    densenet_base = model.get_layer("densenet121")
    last_layer = "conv5_block16_1_conv"
    heatmap = get_heatmap(model, image, last_layer, densenet_base)
    
    # overlay
    result = overlay(org_img, heatmap)
    
    # show both
    fig, axes = plt.subplots(1, 2, figsize=(10, 5))
    axes[0].imshow(org_img.numpy())
    axes[0].set_title("Original")
    axes[0].axis('off')
    axes[1].imshow(result)
    axes[1].set_title("Grad-CAM")
    axes[1].axis('off')
    plt.tight_layout()
    plt.show()


