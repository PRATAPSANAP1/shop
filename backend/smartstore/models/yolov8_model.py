from ultralytics import YOLO
import os

def load_model(model_path="yolov8n.pt"):
    """
    Loads the YOLOv8 model for detection and tracking.
    Downloads the weights automatically if not present.
    """
    # ensure it's downloaded by loading it
    model = YOLO(model_path)
    return model
