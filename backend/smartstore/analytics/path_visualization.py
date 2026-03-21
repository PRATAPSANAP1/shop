import cv2
from collections import defaultdict

class PathVisualizer:
    def __init__(self, max_length=50):
        # Store track history: track_id -> list of (x, y)
        self.track_history = defaultdict(lambda: [])
        self.max_length = max_length

    def update_and_draw(self, frame, track_id, point):
        """
        Updates the history for a given track_id and draws the path on the frame.
        point is a tuple (x, y).
        """
        history = self.track_history[track_id]
        history.append(point)
        if len(history) > self.max_length:
            history.pop(0)

        # Draw the path
        if len(history) > 1:
            for i in range(1, len(history)):
                pt1 = (int(history[i - 1][0]), int(history[i - 1][1]))
                pt2 = (int(history[i][0]), int(history[i][1]))
                cv2.line(frame, pt1, pt2, (255, 0, 0), 2)
        return frame
