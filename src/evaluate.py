import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
import warnings
warnings.filterwarnings('ignore') 
import numpy as np
import src.data_processing as dp
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import tensorflow as tf
tf.get_logger().setLevel('ERROR')  

model=tf.keras.models.load_model('model/densenet_v1.keras')

evaluation_result=model.evaluate(dp.test_ds, verbose=1)

print(f"\nTest Loss: {evaluation_result[0]:.4f}")
print(f"Test Accuracy: {evaluation_result[1]:.4f}")
print(f"Test Recall: {evaluation_result[2]:.4f}")
print(f"Test AUC: {evaluation_result[3]:.4f}")
print(f"Test Precision: {evaluation_result[4]:.4f}")

predictions=model.predict(dp.test_ds)
predicted_labels=(predictions>0.5).astype(int).flatten()  


true_labels=[]
for _,labels in dp.test_ds:
    true_labels.extend(labels.numpy())
true_labels=np.array(true_labels) 

print("Confusion Matrix:")
cm=confusion_matrix(true_labels,predicted_labels)
print(cm)

plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=dp.classes, yticklabels=dp.classes)
plt.title('Confusion Matrix')
plt.ylabel('True Label')
plt.xlabel('Predicted Label')
plt.tight_layout()
plt.savefig('confusion_matrix.png')

print("\nClassification Report:")
rep=classification_report(true_labels,predicted_labels,target_names=dp.classes)
print(rep)

print("PREDICTION DISTRIBUTION")
print(f"Prediction range: {predictions.min():.4f} to {predictions.max():.4f}")
print(f"Mean prediction: {predictions.mean():.4f}")
print(f"Median prediction: {np.median(predictions):.4f}")

normal_preds = predictions[true_labels == 0]
pneumonia_preds = predictions[true_labels == 1]

print(f"\nNormal X-rays predictions (should be low):")
print(f"  Mean: {normal_preds.mean():.4f}, Min: {normal_preds.min():.4f}, Max: {normal_preds.max():.4f}")
print(f"  Individual: {normal_preds.flatten()[:10]}") 

print(f"\nPneumonia X-rays predictions (should be high):")
print(f"  Mean: {pneumonia_preds.mean():.4f}, Min: {pneumonia_preds.min():.4f}, Max: {pneumonia_preds.max():.4f}")

print("TESTING DIFFERENT THRESHOLDS")

for threshold in [0.3, 0.4, 0.5, 0.6, 0.7]:
    predicted_labels_test = (predictions > threshold).astype(int).flatten()
    cm_test = confusion_matrix(true_labels, predicted_labels_test)

    tn, fp, fn, tp = cm_test.ravel()
    accuracy = (tp + tn) / (tp + tn + fp + fn)
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    
    print(f"\nThreshold: {threshold}")
    print(f"Normal correctly identified: {tn}/{tn+fp}")
    print(f"Pneumonia correctly identified: {tp}/{tp+fn}")
    print(f"Accuracy: {accuracy:.2%}")
    print(f"Recall (Pneumonia): {recall:.2%}")
    print(f"Precision: {precision:.2%}")