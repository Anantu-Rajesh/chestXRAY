import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  
import warnings
warnings.filterwarnings('ignore')  
from src.model import create_model
import src.data_processing as dp
import tensorflow as tf
tf.get_logger().setLevel('ERROR')
import src.config as config

model=create_model(input_shape=config.img_size +(3,),trainable_base=False)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss='binary_crossentropy',
    metrics=['accuracy','recall','AUC','Precision']
)

print("PHASE 1: TRAINING WITH FROZEN BASE")

history_1=model.fit(
    dp.train_ds_aug,
    validation_data=dp.val_ds,
    epochs=config.epoch,
    verbose=2,
    callbacks=[
        tf.keras.callbacks.EarlyStopping(monitor='val_loss',patience=3,restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=2)
    ]
)
model.save('model/densenet_v1_p1.keras')
print(f"PHASE 1 COMPLETE")
print(f"Final Training Accuracy: {history_1.history['accuracy'][-1]:.4f}")
print(f"Final Validation Accuracy: {history_1.history['val_accuracy'][-1]:.4f}")

for layer in model.layers:
    if isinstance(layer, tf.keras.Model) and 'densenet' in layer.name.lower():
        base_model = layer
        break

base_model.trainable = True

for layers in base_model.layers[:-20]:
    layers.trainable=False

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss='binary_crossentropy',
    metrics=['accuracy','recall','AUC','Precision']
)

print("PHASE 2: FINE-TUNING")

history_2=model.fit(
    dp.train_ds_aug,
    validation_data=dp.val_ds,
    epochs=config.epoch,
    verbose=2,
    callbacks=[
        tf.keras.callbacks.EarlyStopping(monitor='val_loss',patience=5,restore_best_weights=True),
    ]
)
model.save('model/densenet_v1.keras') 

print("TRAINING COMPLETE (strong weights and val_split 0.25) - FINAL RESULTS")
print(f"Final Training Accuracy: {history_2.history['accuracy'][-1]:.4f}")
print(f"Final Validation Accuracy: {history_2.history['val_accuracy'][-1]:.4f}")
print(f"Final Validation AUC: {history_2.history['val_AUC'][-1]:.4f}")
