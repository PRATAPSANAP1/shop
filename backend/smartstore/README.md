# SmartStore AI

Computer Vision-Based Customer Behavior Analytics for Retail Layout Optimization.

## Project Overview

**SMARTSTORE AI** analyzes CCTV footage from a retail store to understand customer movement patterns and optimize store layout and product placement using computer vision and machine learning. 

This system detects customers, tracks their movement, analyzes behavior, generates analytics, and provides intelligent recommendations via two tailored dashboards:
1. **Data Analyst Dashboard**: Detailed metrics, heatmaps, and movement prediction patterns.
2. **Shopkeeper Dashboard**: High-level, actionable insights to adjust store layout.

## Features List

- **AI Customer Detection**: Uses YOLOv8.
- **Customer Tracking**: Uses built-in tracking in YOLO (ByteTrack/BotSORT).
- **Zone-Based Analytics**: Divides the store into polygons to track specific area visits.
- **Heatmap Generation**: Visualizes high-traffic areas over time.
- **Dwell Time Tracking**: Calculates average time spent per zone per unique customer.
- **Movement Prediction**: Random Forest model to predict user movement between zones.
- **AI Recommendation Engine**: Recommends product placements based on dwell vs. traffic discrepancies.

## Tech Stack

- **Computer Vision**: OpenCV, Ultralytics YOLOv8
- **Machine Learning**: Scikit-Learn (RandomForest)
- **Data Handling**: Pandas, SQL (SQLite3), NumPy
- **Dashboards**: Streamlit, Plotly
- **Environment**: Python 3.9+

## Folder Structure

```
SmartStore-AI/
│
├── data/                       # Stores generated heatmaps and SQLite DB
│   └── videos/                 # Place your sample video 'sample.mp4' here
├── models/
│   └── yolov8_model.py         # YOLO Model Wrapper
├── detection/
│   └── customer_detection.py
├── tracking/
│   └── customer_tracking.py
├── analytics/
│   ├── heatmap_generator.py
│   ├── zone_analysis.py
│   ├── dwell_time_analysis.py
│   └── path_visualization.py
├── prediction/
│   └── movement_prediction.py  # ML Movement Predictor
├── recommendation/
│   └── product_placement_ai.py # AI Suggestion Engine
├── dashboard/
│   ├── analytics_dashboard.py
│   └── shopkeeper_dashboard.py
├── utils/
│   ├── config.py               # Important Settings (Zones, Resolution)
│   └── helpers.py
│
├── main.py                     # Primary pipeline execution
├── requirements.txt
└── README.md
```

## Setup & Running Instructions

### 1. Installation

```bash
# Clone the repository
git clone <repository_url>
cd SmartStore-AI

# Install requirements
pip install -r requirements.txt
```

### 2. Prepare Data

Place a sample retail surveillance video inside the `data/videos/` folder and name it `sample.mp4`.
If no video is provided, the pipeline will display a prompt indicating where to place the video.

### 3. Run the Analytics Pipeline

```bash
python main.py
```
This script will:
- Process the video using YOLOv8.
- Track characters and map coordinates to predefined zones.
- Store results in a local SQLite database (`data/store_data.db`).
- Print the processing speed.
- Generate a heatmap (`data/heatmap.png`).
- Exit. 

*(Wait for this process to finish before launching the dashboards for the best result).*

### 4. Run Dashboards

In a new terminal, launch the Data Analyst Dashboard:
```bash
streamlit run dashboard/analytics_dashboard.py
```

In another terminal (or sequentially), launch the Shopkeeper Dashboard:
```bash
streamlit run dashboard/shopkeeper_dashboard.py
```

## Customizing Store Zones

To adjust the store layout polygons (zones) to match your specific video angle and resolution, edit the `STORE_ZONES` variable inside `utils/config.py`.

Example:
```python
STORE_ZONES = {
    "Entrance": [(0, 0), (200, 0), (200, 200), (0, 200)],
    ...
}
```

## Hackathon Polish Details

- **Modularity**: The codebase strictly follows SOC (Separation of Concerns).
- **Readability**: Code is well-commented for an efficient team-read.
- **No Heavy Servers**: We leverage local SQLite to ensure the pipeline is completely offline and easily portable without Docker-based DB setups. 

---
*Generated for SMARTSTORE AI Hackathon submission.*
