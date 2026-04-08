import cv2
import time
from utils.config import VIDEO_DIR, STORE_ZONES
from utils.helpers import init_db, db_insert_trajectory, get_zone_for_point, draw_zones
from detection.customer_detection import CustomerDetector
from tracking.customer_tracking import CustomerTracker
from analytics.path_visualization import PathVisualizer
from analytics.heatmap_generator import generate_heatmap

def run_pipeline(video_path):
    print(f"Initializing SmartStore AI Pipeline on {video_path}...")
    
    # Initialize DB
    init_db()

    # Initialize Modules
    tracker = CustomerTracker()
    path_visualizer = PathVisualizer(max_length=60)
    
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print(f"Error opening video file: {video_path}")
        return

    frame_id = 0
    start_time = time.time()

    print("Processing video frames. Press 'q' to stop.")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        # Resize frame for processing consistency (optional, based on your coords)
        frame = cv2.resize(frame, (640, 480))
        
        # Run tracking
        results = tracker.track(frame)
        
        # Draw Zones
        annotated_frame = draw_zones(frame.copy(), STORE_ZONES)
        
        if results and results[0].boxes and results[0].boxes.id is not None:
            boxes = results[0].boxes.xywh.cpu().numpy() # [x_center, y_center, width, height]
            track_ids = results[0].boxes.id.int().cpu().tolist()
            
            for box, track_id in zip(boxes, track_ids):
                x_center, y_center = float(box[0]), float(box[1])
                
                # Determine Zone
                current_zone = get_zone_for_point((x_center, y_center), STORE_ZONES)
                
                # Insert into DB
                db_insert_trajectory(frame_id, track_id, x_center, y_center, current_zone)
                
                # Update visualizer
                annotated_frame = path_visualizer.update_and_draw(annotated_frame, track_id, (x_center, y_center))
                
                # Optional: draw bounding box and ID
                cv2.circle(annotated_frame, (int(x_center), int(y_center)), 5, (0, 0, 255), -1)
                cv2.putText(annotated_frame, f"ID: {track_id}", (int(x_center), int(y_center) - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
        
        cv2.imshow("SmartStore AI - Live Pipeline", annotated_frame)
        frame_id += 1
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    
    end_time = time.time()
    print(f"Processed {frame_id} frames in {end_time - start_time:.2f} seconds.")
    
    print("Generating post-processing analytics (e.g., Heatmap)...")
    generate_heatmap()
    print("Pipeline finished successfully. You can now launch the dashboards.")

if __name__ == "__main__":
    import os
    sample_video = os.path.join(VIDEO_DIR, "sample.mp4")
    
    if os.path.exists(sample_video):
        video_source = sample_video
    else:
        print(f"Warning: {sample_video} not found. Attempting to use webcam...")
        video_source = 0 # Webcam
        
    run_pipeline(video_source)
