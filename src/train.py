import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TensorFlow warnings
import warnings
warnings.filterwarnings('ignore')  # Suppress Python warnings
from model import create_model
import data_processing as dp
import tensorflow as tf
tf.get_logger().setLevel('ERROR')
import config

#step 1: Train with frozen base model
model=create_model(input_shape=config.img_size +(3,),trainable_base=False)

#step 2:Compiling model(taking learning rat as 1e-3 or 0.001)
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss='binary_crossentropy',
    metrics=['accuracy','recall','AUC','Precision']
)

print("\n" + "="*60)
print("PHASE 1: TRAINING WITH FROZEN BASE")
print("="*60 + "\n")


#step 3: Training model with class weights
history_1=model.fit(
    dp.train_ds_aug,
    validation_data=dp.val_ds,
    epochs=config.epoch,
    verbose=2,
    #class_weight=dp.class_weight_balanced,
    callbacks=[
        tf.keras.callbacks.EarlyStopping(monitor='val_loss',patience=3,restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=2)
    ]
)
model.save('model/densenet_v1_p1.keras')
print("\n" + "="*60)
print(f"PHASE 1 COMPLETE")
print(f"Final Training Accuracy: {history_1.history['accuracy'][-1]:.4f}")
print(f"Final Validation Accuracy: {history_1.history['val_accuracy'][-1]:.4f}")
print("="*60 + "\n")


#step 4: Fine-tuning by unfreezing some layers of same model
# Find the DenseNet121 layer by type
for layer in model.layers:
    if isinstance(layer, tf.keras.Model) and 'densenet' in layer.name.lower():
        base_model = layer
        break

base_model.trainable = True

#keep early layers frozen and unfreeze last 20 layers
for layers in base_model.layers[:-20]:
    layers.trainable=False
    
#step 5: Compiling again with lower learning rate
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss='binary_crossentropy',
    metrics=['accuracy','recall','AUC','Precision']
)

print("\n" + "="*60)
print("PHASE 2: FINE-TUNING")
print("="*60 + "\n")

#step 6: Training again
history_2=model.fit(
    dp.train_ds_aug,
    validation_data=dp.val_ds,
    epochs=config.epoch,
    verbose=2,
    #class_weight=dp.class_weight_balanced,
    callbacks=[
        tf.keras.callbacks.EarlyStopping(monitor='val_loss',patience=5,restore_best_weights=True),
    ]
)
model.save('model/densenet_v1.keras') #saves final model(with fine-tuning)

#visualising results
print("\n" + "="*60)
print("TRAINING COMPLETE (strong weights and val_split 0.25) - FINAL RESULTS")
print("="*60)
print(f"Final Training Accuracy: {history_2.history['accuracy'][-1]:.4f}")
print(f"Final Validation Accuracy: {history_2.history['val_accuracy'][-1]:.4f}")
print(f"Final Validation AUC: {history_2.history['val_AUC'][-1]:.4f}")
print("="*60 + "\n")