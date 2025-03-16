from transformers import AutoModel
import torch

model_name = "./fine-tuned-bert"  # Replace with your model path

# Load the model from safetensors
model = AutoModel.from_pretrained(model_name, trust_remote_code=True)

# Save as .pt first
torch.save(model.state_dict(), f"{model_name}/model.pt")

# Convert to .h5 using tensorflow
import tensorflow as tf
import tf_keras

# Define a dummy input
dummy_input = torch.randint(0, 30522, (1, 128)).long()

# Export to ONNX
torch.onnx.export(
    model,
    dummy_input,
    f"{model_name}/model.onnx",
    export_params=True,
    opset_version=14,  # Use 14 or higher
    do_constant_folding=True,
    input_names=['input_ids'],
    output_names=['output'],
    dynamic_axes={'input_ids': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
)

# Convert ONNX to TensorFlow
import onnx
from onnx2tf import convert

convert(
    input_onnx_file_path=f"{model_name}/model.onnx",
    output_folder_path=f"{model_name}/saved_model",
    output_signaturedefs=True,
    non_verbose=False
)

# Convert SavedModel to .h5
tf_model = tf.keras.models.load_model(f"{model_name}/saved_model")
tf_model.save(f"{model_name}/model.h5")

print("Model converted to .h5 format!")
