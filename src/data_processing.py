#This file includes loading the dataset and the preprocessing steps involved 

#Setup and Import all necessary Libraries
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TensorFlow warnings
import warnings
warnings.filterwarnings('ignore')  # Suppress Python warnings
import config
import numpy as np
import pandas as pd 
import matplotlib.pyplot as plt
import tensorflow as tf
tf.get_logger().setLevel('ERROR')  # Suppress TensorFlow Python warnings
from collections import Counter


#Load the Dataset from the directory specified in config.py 
image_count = len(list(config.data_dir.glob('*/*/*.jpeg')))
print(f"Total images found: {image_count}")

#Load the training data and use 20% of it for validation set 
#The image dimension and batch size are set(mentioned in config.py)
#Using the image_dataset_from_directory method from keras.preprocessing greyscale is already converted to RGB
train_ds=tf.keras.preprocessing.image_dataset_from_directory(
    config.train_dir,
    validation_split=config.validation_split,
    subset='training',
    seed=123,
    image_size=config.img_size,
    batch_size=config.batch_size,
    labels='inferred'
)
val_ds=tf.keras.preprocessing.image_dataset_from_directory(
    config.train_dir,
    validation_split=config.validation_split,
    subset='validation',
    seed=123,
    image_size=config.img_size,
    batch_size=config.batch_size,
    labels='inferred'
)
#loading test data
test_ds=tf.keras.preprocessing.image_dataset_from_directory(
    config.test_dir,
    image_size=config.img_size,
    batch_size=config.batch_size,
    labels='inferred'
)

#label count (this is useful for class weights calculation later)
label_counts = Counter()
for _, labels in train_ds:
    label_counts.update(labels.numpy())
print(label_counts)

#seeing the class names
classes=train_ds.class_names
print(f"classes are: {classes}")

#visualizing some images from the dataset
plt.figure(figsize=(10,10))
for images,labels in train_ds.take(1):
    print(f"Single image shape: {images[0].shape}")
    for i in range(9):
        plt.subplot(3,3,i+1)
        plt.imshow(images[i].numpy().astype("uint8"))
        plt.title(classes[labels[i]])
        plt.axis("off")
plt.show()

#checking the shape of images, if it(224,224,3) it means greyscale to RGB conversion already carried out
for images,labels in train_ds.take(2):
    print(f"Batch image shape: {images.shape}")
    print(f"Single image shape: {images[0].shape}")
    
#Data augmentation- applying small rotations, translations and zooms to prevent overfitting to just the training dataset
data_augmentation=tf.keras.Sequential([
    tf.keras.layers.RandomRotation(0.014), # around 5 degrees rotation
    tf.keras.layers.RandomZoom(0.1), # zoom in by 10%
    tf.keras.layers.RandomTranslation(0.05,0.05) # shift pixels is 0.05x224 which is around 11 pixels
])

train_ds_aug=train_ds.map(lambda x,y:(data_augmentation(x,training=True),y))   #len of train_ds_aug = len of train_ds

#Data scaling/ normalisation: normalising/rescaling rgb values to [0,1] from [0,255]
#normalisation_layer=tf.keras.layers.Rescaling(1./255) # the 1. helps with float division (this line returns value in range 0-1)

#train_ds_scaled=train_ds_aug.map(lambda x,y:(normalisation_layer(x),y)) #here x is the image and y is the label, y remains unchanged while x is scaled
#val_ds_scaled=val_ds.map(lambda x,y:(normalisation_layer(x),y))
#test_ds_scaled=test_ds.map(lambda x,y:(normalisation_layer(x),y))

#check a batch of images to see if normalisation is done properly
#ds_list=[train_ds_scaled,val_ds_scaled,test_ds_scaled]
#for i in ds_list:
#    #image_batch, labels_batch = next(iter(i))
#    #first_image = image_batch[0]
#    # Notice the pixel values are now in [0,1].
#    #print(np.min(first_image), np.max(first_image))
    
#finding length of classes in train set so that we can see class imbalance and assign class weights
train_class_counts = {}
for images, labels in train_ds:
    for label in labels.numpy():
        class_name = classes[label]
        if class_name in train_class_counts:
            train_class_counts[class_name] += 1
        else:
            train_class_counts[class_name] = 1
print("Class distribution in training set:", train_class_counts)

#assigning class weights to handle class imbalance( the model ignores the minority class completely to optimize overall accuracy which is wrong)
#from classcounts we know pneumonia class has more images than normal class
#now class weight calculated as total_images/ (num_classes * images_in_class)
total_samples = sum(label_counts.values())
num_classes = len(label_counts)

class_weight = {
    cls: total_samples / (num_classes * count)
    for cls, count in label_counts.items()
}

print(class_weight)

