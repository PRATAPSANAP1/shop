import cv2
import numpy as np
import sqlite3
import os
from utils.config import DB_PATH

def init_db():
    """Initializes the SQLite database with required tables."""
    # Ensure directory exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create tables for trajectories
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS trajectories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            frame_id INTEGER,
            track_id INTEGER,
            x_center REAL,
            y_center REAL,
            zone TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create table for dwell time and zone transitions
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS zone_analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            track_id INTEGER,
            zone TEXT,
            entry_time DATETIME,
            exit_time DATETIME,
            dwell_time REAL
        )
    ''')
    
    conn.commit()
    conn.close()

def db_insert_trajectory(frame_id, track_id, x_center, y_center, zone):
    """Inserts a trajectory point into the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO trajectories (frame_id, track_id, x_center, y_center, zone)
        VALUES (?, ?, ?, ?, ?)
    ''', (frame_id, track_id, x_center, y_center, zone))
    conn.commit()
    conn.close()

def point_in_polygon(point, polygon):
    """
    Check if a point (x, y) is inside a polygon using cv2.pointPolygonTest
    """
    pt = (float(point[0]), float(point[1]))
    poly = np.array(polygon, dtype=np.int32)
    result = cv2.pointPolygonTest(poly, pt, False)
    return result >= 0

def get_zone_for_point(point, zones):
    """Returns the zone name for a given point, or None if outside all zones."""
    for zone_name, polygon in zones.items():
        if point_in_polygon(point, polygon):
            return zone_name
    return None

def draw_zones(frame, zones):
    """
    Draw configured zones on the video frame
    """
    for zone_name, polygon in zones.items():
        pts = np.array(polygon, np.int32)
        pts = pts.reshape((-1, 1, 2))
        cv2.polylines(frame, [pts], True, (0, 255, 0), 2)
        
        # Put text near the first point of the polygon
        cv2.putText(frame, zone_name, (polygon[0][0] + 10, polygon[0][1] + 20), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    return frame
