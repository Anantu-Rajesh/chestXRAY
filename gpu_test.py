import tensorflow as tf
import os

# Set environment variables for GPU
os.environ['TF_FORCE_GPU_ALLOW_GROWTH'] = 'true'

print("TensorFlow version:", tf.__version__)
print("Built with CUDA:", tf.test.is_built_with_cuda())
print("\nPhysical devices:")
print("  CPUs:", tf.config.list_physical_devices('CPU'))
print("  GPUs:", tf.config.list_physical_devices('GPU'))
print("\nNum GPUs Available:", len(tf.config.list_physical_devices('GPU')))

# Try to get GPU device details
if tf.config.list_physical_devices('GPU'):
    print("\nGPU Details:")
    for gpu in tf.config.list_physical_devices('GPU'):
        print(f"  {gpu}")
        details = tf.config.experimental.get_device_details(gpu)
        print(f"  Device details: {details}")
else:
    print("\n⚠️ No GPU detected!")
    print("For TensorFlow GPU support on Windows:")
    print("  - TensorFlow 2.10+ removed native Windows CUDA support")
    print("  - Options: Use WSL2 or downgrade to TensorFlow 2.10 with Python 3.10")
