import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  
import warnings
warnings.filterwarnings('ignore')  
import tensorflow as tf
tf.get_logger().setLevel('ERROR')
from tensorflow.keras import layers, models
from tensorflow.keras.applications import DenseNet121
import src.config as config

def create_model(input_shape=config.img_size +(3,),trainable_base=False):
    base_model=DenseNet121(
        include_top=False,
        weights='imagenet',
        input_shape=input_shape
    )

    base_model.trainable=trainable_base
    inputs =layers.Input(shape=input_shape)

    x=tf.keras.applications.densenet.preprocess_input(inputs)
    x=base_model(x,training=False)

    x=layers.GlobalAveragePooling2D()(x)
    x=layers.Dropout(0.3)(x)
    x=layers.Dense(128,activation='relu')(x)
    x=layers.Dropout(0.2)(x)
    outputs=layers.Dense(1,activation='sigmoid')(x)

    model=models.Model(inputs=inputs,outputs=outputs)
    return model