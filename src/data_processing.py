import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  
import warnings
warnings.filterwarnings('ignore')  
import src.config as config
import matplotlib.pyplot as plt
import tensorflow as tf
tf.get_logger().setLevel('ERROR')  
from collections import Counter
import random
from collections import defaultdict

normal_files = list(config.data_dir.glob('NORMAL/*.jpeg'))
pneumonia_files = list(config.data_dir.glob('PNEUMONIA/**/*.jpeg'))

all_files = []
all_labels = []
classes = ['NORMAL', 'PNEUMONIA']

for f in normal_files:
    all_files.append(str(f))
    all_labels.append(0)  # NORMAL = 0

for f in pneumonia_files:
    all_files.append(str(f))
    all_labels.append(1)  # PNEUMONIA = 1

print(f"Found {len(all_files)} files belonging to 2 classes.")

patient_data = defaultdict(list)

for filepath, label in zip(all_files, all_labels):
    filename = os.path.basename(filepath)

    if filename.startswith('person'):
        patient_id = filename.split('_')[0]  
    elif filename.startswith('img-'):
        patient_id = 'normal_' + filename.split('-')[1]  
    else:
        patient_id = filename 
    
    patient_data[patient_id].append((filepath, label))

print(f"Total unique patients: {len(patient_data)}")

random.seed(123)
patient_ids = list(patient_data.keys())
random.shuffle(patient_ids)

n_patients = len(patient_ids)
train_patients = patient_ids[:int(0.6 * n_patients)]
val_patients = patient_ids[int(0.6 * n_patients):int(0.8 * n_patients)]
test_patients = patient_ids[int(0.8 * n_patients):]

print(f"Train patients: {len(train_patients)}, Val patients: {len(val_patients)}, Test patients: {len(test_patients)}")

train_files, train_labels = [], []
val_files, val_labels = [], []
test_files, test_labels = [], []

for pid in train_patients:
    for filepath, label in patient_data[pid]:
        train_files.append(filepath)
        train_labels.append(label)

for pid in val_patients:
    for filepath, label in patient_data[pid]:
        val_files.append(filepath)
        val_labels.append(label)

for pid in test_patients:
    for filepath, label in patient_data[pid]:
        test_files.append(filepath)
        test_labels.append(label)

print(f"Train images: {len(train_files)}, Val images: {len(val_files)}, Test images: {len(test_files)}")

def load_and_preprocess(filepath, label):
    image = tf.io.read_file(filepath)
    image = tf.image.decode_jpeg(image, channels=3)  
    image = tf.image.resize(image, config.img_size)
    image = tf.cast(image, tf.float32)  
    return image, label

train_ds = tf.data.Dataset.from_tensor_slices((train_files, train_labels))
train_ds = train_ds.map(load_and_preprocess, num_parallel_calls=tf.data.AUTOTUNE)
train_ds = train_ds.shuffle(1000).batch(config.batch_size).prefetch(tf.data.AUTOTUNE)

val_ds = tf.data.Dataset.from_tensor_slices((val_files, val_labels))
val_ds = val_ds.map(load_and_preprocess, num_parallel_calls=tf.data.AUTOTUNE)
val_ds = val_ds.batch(config.batch_size).prefetch(tf.data.AUTOTUNE)

test_ds = tf.data.Dataset.from_tensor_slices((test_files, test_labels))
test_ds = test_ds.map(load_and_preprocess, num_parallel_calls=tf.data.AUTOTUNE)
test_ds = test_ds.batch(config.batch_size).prefetch(tf.data.AUTOTUNE)

label_counts = Counter(train_labels)
print(label_counts)
print(f"classes are: {classes}")

plt.figure(figsize=(10,10))
for images,labels in train_ds.take(1):
    print(f"Single image shape: {images[0].shape}")
    for i in range(9):
        plt.subplot(3,3,i+1)
        plt.imshow(images[i].numpy().astype("uint8"))
        plt.title(classes[labels[i]])
        plt.axis("off")
plt.show()

for images,labels in train_ds.take(2):
    print(f"Batch image shape: {images.shape}")
    print(f"Single image shape: {images[0].shape}")

data_augmentation=tf.keras.Sequential([
    tf.keras.layers.RandomRotation(0.014), 
    tf.keras.layers.RandomZoom(0.1), 
    tf.keras.layers.RandomTranslation(0.05,0.05) # shift pixels is 0.05x224 basically 11 pixels-ish
])

'''train_ds_aug=train_ds.map(lambda x,y:(data_augmentation(x,training=True),y))   

Data scaling/ normalisation: normalising/rescaling rgb values to [0,1] from [0,255]
normalisation_layer=tf.keras.layers.Rescaling(1./255) # the 1. helps with float division (this line returns value in range 0-1)

train_ds_scaled=train_ds_aug.map(lambda x,y:(normalisation_layer(x),y)) #here x is the image and y is the label, y remains unchanged while x is scaled
val_ds_scaled=val_ds.map(lambda x,y:(normalisation_layer(x),y))
test_ds_scaled=test_ds.map(lambda x,y:(normalisation_layer(x),y))

check a batch of images to see if normalisation is done properly
ds_list=[train_ds_scaled,val_ds_scaled,test_ds_scaled]
for i in ds_list:
    image_batch, labels_batch = next(iter(i))
    first_image = image_batch[0]
    print(np.min(first_image), np.max(first_image))'''

train_class_counts = {}
for images, labels in train_ds:
    for label in labels.numpy():
        class_name = classes[label]
        if class_name in train_class_counts:
            train_class_counts[class_name] += 1
        else:
            train_class_counts[class_name] = 1
print("Class distribution in training set:", train_class_counts)

'''assigning class weights to handle class imbalance
from classcounts we know pneumonia class has more images than normal class
now class weight calculated as total_images/ (num_classes * images_in_class)'''
total_samples = sum(label_counts.values())
num_classes = len(label_counts)

class_weight = {
    cls: total_samples / (num_classes * count)
    for cls, count in label_counts.items()
}
class_weight_balanced = {0: 1.0, 1: 1.0}
class_weight_gentle = {0: 1.2, 1: 0.9}
class_weight_strong = {0: 1.5, 1: 0.8}
class_weight_very_strong = {0: 2.5, 1: 0.7}

print(class_weight)

