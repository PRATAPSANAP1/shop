import sqlite3
import pandas as pd
from utils.config import DB_PATH

def get_zone_traffic_stats():
    """
    Returns a pandas DataFrame of customer counts per zone.
    """
    conn = sqlite3.connect(DB_PATH)
    query = '''
    SELECT zone, COUNT(DISTINCT track_id) as visitors
    FROM trajectories
    WHERE zone IS NOT NULL
    GROUP BY zone
    ORDER BY visitors DESC
    '''
    df = pd.read_sql_query(query, conn)
    conn.close()
    return df

def get_traffic_over_time():
    """
    Returns tracking volume over time (using minutes).
    """
    conn = sqlite3.connect(DB_PATH)
    query = '''
    SELECT 
      strftime('%Y-%m-%d %H:%M', timestamp) as time_bin,
      COUNT(DISTINCT track_id) as active_customers
    FROM trajectories
    GROUP BY time_bin
    ORDER BY time_bin
    '''
    df = pd.read_sql_query(query, conn)
    conn.close()
    return df
