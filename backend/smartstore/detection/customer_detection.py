from models.yolov8_model import load_model
from utils.config import YOLO_MODEL_PATH, CONFIDENCE_THRESHOLD

class CustomerDetector:
    def __init__(self):
        self.model = load_model(YOLO_MODEL_PATH)
        self.conf = CONFIDENCE_THRESHOLD

    def detect(self, frame):
        """
        Detect customers in a given frame.
        We filter by classes=[0] which is the 'person' class in COCO.
        """
        results = self.model(frame, classes=[0], conf=self.conf, verbose=False)
        return results
