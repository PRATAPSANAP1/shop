import sqlite3
import pandas as pd
from utils.config import DB_PATH

def calculate_dwell_times():
    """
    Approximates dwell time per zone per user based on trajectory timestamps.
    Returns a DataFrame with average dwell time per zone, and detailed dwell data.
    """
    conn = sqlite3.connect(DB_PATH)
    # Compute duration in seconds based on min/max of timestamp for the given track_id and zone
    query = '''
    SELECT 
      zone, 
      track_id, 
      MIN(timestamp) as entry_time, 
      MAX(timestamp) as exit_time,
      (julianday(MAX(timestamp)) - julianday(MIN(timestamp))) * 86400.0 as dwell_time_seconds
    FROM trajectories
    WHERE zone IS NOT NULL
    GROUP BY zone, track_id
    '''
    df = pd.read_sql_query(query, conn)
    conn.close()
    
    if df.empty:
        return pd.DataFrame(), pd.DataFrame()
        
    # Aggregate average dwell time per zone
    avg_dwell_time = df.groupby('zone')['dwell_time_seconds'].mean().reset_index()
    avg_dwell_time.rename(columns={'dwell_time_seconds': 'avg_dwell_time_seconds'}, inplace=True)
    avg_dwell_time.sort_values(by='avg_dwell_time_seconds', ascending=False, inplace=True)
    return avg_dwell_time, df
