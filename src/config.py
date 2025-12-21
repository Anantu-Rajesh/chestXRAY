from pathlib import Path

img_size=(224,224) #this is the image size for input as most pretrained models were trained on this size
batch_size=32      #number of images to be passed in one iteration
epoch=10           


data_dir=Path("data/all_img")  #directory where data is stored
#validation_split=0.25 percentage of data to be used for validation