import os

# Project Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
VIDEO_DIR = os.path.join(DATA_DIR, 'videos')
DB_PATH = os.path.join(DATA_DIR, 'store_data.db')

# Ensure directories exist
os.makedirs(VIDEO_DIR, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, 'models'), exist_ok=True)

# Object Detection/Tracking Settings
YOLO_MODEL_PATH = "yolov8n.pt"  # We'll use the nano model for speed
CONFIDENCE_THRESHOLD = 0.5
TRACKER_TYPE = "bytetrack.yaml" # ultralytics built-in tracker or "botsort.yaml"

# Store Zones (Define polygons for regions of interest)
STORE_ZONES = {
    "Entrance": [(0, 0), (320, 0), (320, 240), (0, 240)],
    "Snacks": [(320, 0), (640, 0), (640, 240), (320, 240)],
    "Beverages": [(0, 240), (320, 240), (320, 480), (0, 480)],
    "Checkout": [(320, 240), (640, 240), (640, 480), (320, 480)],
    "Household": [(160, 120), (480, 120), (480, 360), (160, 360)]
}

# Heatmap settings
HEATMAP_RESOLUTION = (640, 480) # W, H
