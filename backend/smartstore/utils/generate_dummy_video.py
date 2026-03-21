import cv2
import numpy as np
import os
from utils.config import VIDEO_DIR

def generate_video(output_path, duration_sec=10, fps=30, width=640, height=480):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    # Define two moving "people"
    person1 = {'pos': [100, 100], 'dir': [3, 2], 'color': (0, 0, 255)}
    person2 = {'pos': [500, 300], 'dir': [-2, -3], 'color': (255, 0, 0)}
    person3 = {'pos': [300, 50], 'dir': [1, 4], 'color': (0, 255, 0)}
    people = [person1, person2, person3]

    num_frames = duration_sec * fps
    
    for i in range(num_frames):
        # Create a blank white frame representing the store floor
        frame = np.ones((height, width, 3), dtype=np.uint8) * 200
        
        # Update and draw people
        for p in people:
            # Update pos
            p['pos'][0] += p['dir'][0]
            p['pos'][1] += p['dir'][1]
            
            # Bounce off walls
            if p['pos'][0] <= 20 or p['pos'][0] >= width - 20:
                p['dir'][0] *= -1
            if p['pos'][1] <= 20 or p['pos'][1] >= height - 20:
                p['dir'][1] *= -1
                
            # Draw as a circle with a "head"
            cv2.circle(frame, (int(p['pos'][0]), int(p['pos'][1])), 15, p['color'], -1)
            cv2.circle(frame, (int(p['pos'][0]), int(p['pos'][1])), 10, (255, 200, 200), -1) # Head
            
        out.write(frame)
        
    out.release()
    print(f"Generated dummy video at {output_path}")

if __name__ == "__main__":
    out_file = os.path.join(VIDEO_DIR, 'sample.mp4')
    generate_video(out_file)
