from pathlib import Path

img_size=(224,224) #this is the image size for input as most pretrained models were trained on this size
batch_size=32      #number of images to be passed in one iteration
epoch=10           

train_dir=Path("data/Chest XRay Dataset/train")  #directory where data is stored
data_dir=Path("data/Chest XRay Dataset")  #directory where data is stored
validation_split=0.2  #percentage of data to be used for validation
test_dir=Path("data/Chest XRay Dataset/test")  #directory where test data is stored
model_dir="model/final_model.h5" #directory where models will be saved