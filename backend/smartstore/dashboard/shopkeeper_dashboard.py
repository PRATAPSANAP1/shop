import streamlit as st
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from analytics.zone_analysis import get_zone_traffic_stats
from agents.retail_agent import RetailOptimizationAgent

st.set_page_config(page_title="Shopkeeper Dashboard", page_icon="🏪", layout="centered")

# Custom CSS for a clean, modern look with background
st.markdown("""
    <style>
    /* Hackathon Premium Dark Mode */
    .stApp {
        background: radial-gradient(circle at 10% 20%, rgb(14, 17, 23) 0%, rgb(42, 42, 53) 90%);
        color: #f8fafc;
    }
    .metric-container {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        padding: 15px;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    }
    h1, h2, h3, h4, .stMarkdown, p, div[data-testid="stMarkdownContainer"] p {
        color: #e2e8f0 !important;
        font-family: 'Helvetica Neue', sans-serif;
    }
    h1 {
        text-align: center;
        text-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
    }
    div[data-testid="stMetricValue"] {
        color: #c084fc !important;
    }
    .stAlert {
        border-radius: 8px;
    }
    </style>
""", unsafe_allow_html=True)

st.title("🏪 Today's Store Insights")
st.markdown("<p style='text-align: center; color: #94a3b8;'>Welcome back! Here's a real-time overview of your store's performance driven by AI tracking.</p>", unsafe_allow_html=True)
st.divider()

traffic_df = get_zone_traffic_stats()

if traffic_df.empty:
    st.info("No data recorded yet. Please run the CCTV analytics pipeline.")
else:
    total_visitors = traffic_df['visitors'].sum()
    busiest_zone = traffic_df.iloc[0]['zone']
    low_traffic_zone = traffic_df.iloc[-1]['zone']

    # Average Dwell Time Calculation for New Insight
    import pandas as pd
    try:
        from analytics.dwell_time_analysis import calculate_dwell_times
        avg_dwell_df, _ = calculate_dwell_times()
        if not avg_dwell_df.empty:
            avg_store_dwell = round(avg_dwell_df['avg_dwell_time_seconds'].mean(), 1)
        else:
            avg_store_dwell = 0
    except:
        avg_store_dwell = 0

    # Calculate Staff Allocation
    staff_recommendation = f"Deploy 1 extra staff member to **{busiest_zone}** due to peak traffic." if total_visitors > 5 else "Current staff allocation is optimal."

    # KPI Cards
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric(label="👥 Total Visitors", value=total_visitors)
    with col2:
        st.metric(label="🔥 Busiest Zone", value=busiest_zone)
    with col3:
        st.metric(label="❄️ Low Traffic Zone", value=low_traffic_zone)
    with col4:
        st.metric(label="⏱️ Avg Stay (s)", value=f"{avg_store_dwell}s")

    st.divider()

    st.subheader("🤖 Store Assistant Suggestions")
    
    agent = RetailOptimizationAgent()
    insights = agent.generate_recommendations()
    
    if insights and "shopkeeper_insights" in insights:
        for rec in insights["shopkeeper_insights"]:
            st.info(rec)
            
    with st.expander("📄 View Daily Summary Report"):
        report = agent.create_daily_store_insight_report()
        st.markdown(report)

    st.divider()

    col_bottom1, col_bottom2 = st.columns(2)
    
    with col_bottom1:
        st.subheader("👔 AI Staff Allocation")
        st.info(f"💡 {staff_recommendation}")
        if total_visitors > 15:
            st.warning("⚠️ High capacity reached! Open a new checkout register.")
        else:
            st.success("✅ Checkout queues are currently clear.")
            
    with col_bottom2:
        st.subheader("🚨 Live Security Alerts")
        if avg_store_dwell > 300:
             st.error(f"🚨 Anomaly: Unusually high dwell time detected. Possible loitering.")
        elif total_visitors > 25:
             st.error(f"🚨 Alert: Maximum Safe Store Capacity Exceeded.")
        else:
             st.success("🛡️ No suspicious activity or anomalies detected.")

    st.divider()
    
    import plotly.express as px
    st.subheader("📊 Traffic Distribution")
    fig = px.bar(traffic_df, x='zone', y='visitors', color='zone', 
                 color_discrete_sequence=px.colors.qualitative.Pastel,
                 template="plotly_dark")
    fig.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
    st.plotly_chart(fig, use_container_width=True)
    
    # Store Crowdedness Gauge insight
    st.subheader("📈 Current Store Capacity")
    max_capacity_estimate = 20 # arbitrary limit for visual
    current_capacity = total_visitors
    progress = min(current_capacity / max_capacity_estimate, 1.0)
    st.progress(progress, text=f"{current_capacity} / {max_capacity_estimate} estimated capacity")
    
    st.divider()
    st.success("Real-time alerts active.")

st.divider()
auto_refresh = st.checkbox("Enable Auto-Refresh", value=True)
if auto_refresh:
    import time
    time.sleep(3)
    st.rerun()
