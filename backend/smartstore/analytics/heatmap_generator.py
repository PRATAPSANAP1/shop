import cv2
import numpy as np
import sqlite3
import os
from utils.config import DB_PATH, HEATMAP_RESOLUTION, DATA_DIR

def generate_heatmap(output_filename="heatmap.png"):
    """
    Generates a heatmap based on saved trajectory coordinates in DB.
    """
    output_path = os.path.join(DATA_DIR, output_filename)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    width, height = HEATMAP_RESOLUTION
    # Initialize blank accumulator image
    accum_image = np.zeros((height, width), dtype=np.float32)

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT x_center, y_center FROM trajectories')
        rows = cursor.fetchall()
        conn.close()
    except Exception as e:
        print(f"Database error: {e}")
        return None

    if not rows:
        return None

    for (x, y) in rows:
        if 0 <= int(x) < width and 0 <= int(y) < height:
            accum_image[int(y), int(x)] += 1

    # Normalize the accumulator
    # Use GaussianBlur to smooth the peaks
    accum_image = cv2.GaussianBlur(accum_image, (35, 35), 0)
    
    max_val = np.max(accum_image)
    if max_val > 0:
        accum_image = (accum_image / max_val) * 255.0

    accum_image = np.uint8(accum_image)
    
    # Apply colormap - uses JET mapping for hot/cold visuals
    colormap = cv2.applyColorMap(accum_image, cv2.COLORMAP_JET)

    # Save image
    cv2.imwrite(output_path, colormap)
    return output_path
