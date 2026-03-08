from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = FastAPI()

# Allow React to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once
model = tf.keras.models.load_model("dr_model.keras")

class_names = ["Mild", "Moderate", "No_DR", "Proliferate_DR", "Severe"]

def preprocess_image(image):
    image = image.resize((224, 224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    processed = preprocess_image(image)
    predictions = model.predict(processed)

    predicted_class = class_names[np.argmax(predictions)]
    confidence = float(np.max(predictions))

    return {
        "prediction": predicted_class,
        "confidence": confidence
    }