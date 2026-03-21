"""
SmartStore data bridge — called by Node.js backend via child_process.
Usage: python smartstore_bridge.py <command> [arg]
Commands: stats | zone_traffic | traffic_over_time | dwell_time | insights | predict <zone> | heatmap | zones
"""
import sys, os, json, base64

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def safe_run(fn, *args):
    try:
        result = fn(*args)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

def cmd_stats():
    from analytics.zone_analysis import get_zone_traffic_stats
    from analytics.dwell_time_analysis import calculate_dwell_times
    df = get_zone_traffic_stats()
    if df.empty:
        return {"hasData": False}
    avg_df, _ = calculate_dwell_times()
    avg_dwell = 0
    if not avg_df.empty:
        avg_dwell = round(float(avg_df['avg_dwell_time_seconds'].mean()), 1)
    return {
        "hasData": True,
        "totalVisitors": int(df['visitors'].sum()),
        "busiestZone": df.iloc[0]['zone'],
        "lowTrafficZone": df.iloc[-1]['zone'],
        "avgDwellSeconds": avg_dwell,
    }

def cmd_zone_traffic():
    from analytics.zone_analysis import get_zone_traffic_stats
    df = get_zone_traffic_stats()
    return df.to_dict(orient='records') if not df.empty else []

def cmd_traffic_over_time():
    from analytics.zone_analysis import get_traffic_over_time
    df = get_traffic_over_time()
    return df.to_dict(orient='records') if not df.empty else []

def cmd_dwell_time():
    from analytics.dwell_time_analysis import calculate_dwell_times
    avg_df, _ = calculate_dwell_times()
    return avg_df.to_dict(orient='records') if not avg_df.empty else []

def cmd_insights():
    from agents.retail_agent import RetailOptimizationAgent
    agent = RetailOptimizationAgent()
    recs = agent.generate_recommendations()
    report = agent.create_daily_store_insight_report()
    return {
        "analystInsights": recs.get("analyst_insights", []),
        "shopkeeperInsights": recs.get("shopkeeper_insights", []),
        "dailyReport": report,
    }

def cmd_predict(zone):
    from prediction.movement_prediction import MovementPredictor
    predictor = MovementPredictor()
    trained = predictor.train()
    if not trained:
        return {"prediction": "Insufficient data to predict"}
    return {"prediction": predictor.predict_next_zone(zone)}

def cmd_heatmap():
    from utils.config import DATA_DIR
    path = os.path.join(DATA_DIR, 'heatmap.png')
    if not os.path.exists(path):
        return {"available": False}
    with open(path, 'rb') as f:
        encoded = base64.b64encode(f.read()).decode('utf-8')
    return {"available": True, "image": f"data:image/png;base64,{encoded}"}

def cmd_zones():
    from analytics.zone_analysis import get_zone_traffic_stats
    df = get_zone_traffic_stats()
    return df['zone'].tolist() if not df.empty else []

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command provided"}))
        sys.exit(1)

    command = sys.argv[1]
    dispatch = {
        'stats': lambda: safe_run(cmd_stats),
        'zone_traffic': lambda: safe_run(cmd_zone_traffic),
        'traffic_over_time': lambda: safe_run(cmd_traffic_over_time),
        'dwell_time': lambda: safe_run(cmd_dwell_time),
        'insights': lambda: safe_run(cmd_insights),
        'heatmap': lambda: safe_run(cmd_heatmap),
        'zones': lambda: safe_run(cmd_zones),
    }

    if command == 'predict':
        zone = sys.argv[2] if len(sys.argv) > 2 else ''
        safe_run(cmd_predict, zone)
    elif command in dispatch:
        dispatch[command]()
    else:
        print(json.dumps({"error": f"Unknown command: {command}"}))
