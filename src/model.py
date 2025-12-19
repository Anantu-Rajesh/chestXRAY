import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TensorFlow warnings
import warnings
warnings.filterwarnings('ignore')  # Suppress Python warnings
import tensorflow as tf
tf.get_logger().setLevel('ERROR')
from tensorflow.keras import layers, models
from tensorflow.keras.applications import EfficientNetB0
import config


def create_model(input_shape=config.img_size +(3,),trainable_base=False):
    #step 1: Loading efficientnetB0 model
    base_model=EfficientNetB0(
        include_top=False,
        weights='imagenet',
        input_shape=input_shape
    )
    
    #step 2: Freeze base model
    base_model.trainable=trainable_base
    
    #step 3: Adding layer on top of base as per our needs
    inputs =layers.Input(shape=input_shape)
    
    #step 4: Applying preprocessing for the model which normalises values to range(-1,1)
    x=tf.keras.applications.efficientnet.preprocess_input(inputs)
    
    #step 5: passing this data to base model
    x=base_model(x,training=False)
    
    #step 6: Adding pooling layer( reduces the dimension from for ex (7,7,1280) to (1280) )
    x=layers.GlobalAveragePooling2D()(x)
    
    #step 7:Adding dropout(randomly removing some neurons during training) to prevent overfitting
    x=layers.Dropout(0.3)(x)
    
    #step 8: Adding dense layer 
    x=layers.Dense(128,activation='relu')(x)
    x=layers.Dropout(0.2)(x)
    
    #step 9: Output layer with sigmoid as binary classification
    outputs=layers.Dense(1,activation='sigmoid')(x)
     
    #step 10:creating the model
    model=models.Model(inputs=inputs,outputs=outputs)
    return model