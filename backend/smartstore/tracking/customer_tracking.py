from models.yolov8_model import load_model
from utils.config import YOLO_MODEL_PATH, CONFIDENCE_THRESHOLD, TRACKER_TYPE

class CustomerTracker:
    def __init__(self):
        self.model = load_model(YOLO_MODEL_PATH)
        self.conf = CONFIDENCE_THRESHOLD
        self.tracker = TRACKER_TYPE

    def track(self, frame):
        """
        Track customers across frames using YOLOv8 built-in tracking (bytetrack/botsort).
        persist=True keeps tracks alive across consecutive frames.
        """
        results = self.model.track(frame, classes=[0], conf=self.conf, 
                                   tracker=self.tracker, persist=True, verbose=False)
        return results
