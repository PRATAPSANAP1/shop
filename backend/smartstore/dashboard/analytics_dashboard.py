import streamlit as st
import pandas as pd
import plotly.express as px
import os
import sqlite3
import sys

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from analytics.zone_analysis import get_zone_traffic_stats, get_traffic_over_time
from analytics.dwell_time_analysis import calculate_dwell_times
from utils.config import DATA_DIR
from prediction.movement_prediction import MovementPredictor
from agents.retail_agent import RetailOptimizationAgent

st.set_page_config(page_title="Data Analyst Dashboard", page_icon="📈", layout="wide")

st.markdown("""
    <style>
    /* Hackathon Premium Dark Mode */
    .stApp {
        background: radial-gradient(circle at 10% 20%, rgb(14, 17, 23) 0%, rgb(42, 42, 53) 90%);
        color: #f8fafc;
    }
    .main {
        background-color: transparent;
    }
    h1, h2, h3, h4, .stMarkdown, p, div[data-testid="stMarkdownContainer"] p {
        color: #e2e8f0 !important;
        font-family: 'Helvetica Neue', sans-serif;
    }
    h1 {
        text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
    }
    .stMetric {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    }
    div[data-testid="stMetricValue"] {
        color: #38bdf8 !important;
    }
    </style>
""", unsafe_allow_html=True)

st.title("📈 SmartStore AI - Data Analyst Dashboard")

# Top metrics
traffic_df = get_zone_traffic_stats()
if not traffic_df.empty:
    total_customers = traffic_df['visitors'].sum()
    busiest_zone = traffic_df.iloc[0]['zone']
    
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Unique Customers", total_customers)
    col2.metric("Busiest Zone", busiest_zone)
    col3.metric("Least Visited Zone", traffic_df.iloc[-1]['zone'])
    
    # Calculate Peak Traffic Time insight
    time_df = get_traffic_over_time()
    peak_time_str = "N/A"
    if not time_df.empty:
        peak_idx = time_df['active_customers'].idxmax()
        peak_time_str = time_df.iloc[peak_idx]['time_bin']
        
    col4.metric("Peak Traffic Time", peak_time_str)

st.divider()

col_charts1, col_charts2 = st.columns(2)

with col_charts1:
    st.subheader("📊 Zone Traffic Analysis")
    if not traffic_df.empty:
        fig = px.bar(traffic_df, x='zone', y='visitors', color='zone', 
                     title="Total Visitors per Zone",
                     color_discrete_sequence=px.colors.qualitative.Pastel,
                     template="plotly_dark")
        fig.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig, use_container_width=True)
        
        # New Insight: Pie Chart of Distribution
        fig_pie = px.pie(traffic_df, values='visitors', names='zone', 
                         title="Zone Traffic Distribution",
                         color_discrete_sequence=px.colors.sequential.RdBu,
                         template="plotly_dark")
        fig_pie.update_layout(paper_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig_pie, use_container_width=True)
        
    else:
        st.info("No traffic data available.")

    st.subheader("📈 Traffic Over Time")
    time_df = get_traffic_over_time()
    if not time_df.empty:
        fig2 = px.line(time_df, x='time_bin', y='active_customers', 
                       title="Active Customers Over Time", markers=True,
                       template="plotly_dark")
        fig2.update_traces(line=dict(color="#3b82f6", width=3))
        fig2.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig2, use_container_width=True)

with col_charts2:
    st.subheader("⏱️ Dwell Time Analysis")
    avg_dwell_df, detailed_dwell_df = calculate_dwell_times()
    if not avg_dwell_df.empty:
        fig3 = px.bar(avg_dwell_df, x='avg_dwell_time_seconds', y='zone', orientation='h',
                      title="Average Dwell Time (Seconds)",
                      color_discrete_sequence=['#10b981'],
                      template="plotly_dark")
        fig3.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
        st.plotly_chart(fig3, use_container_width=True)

    st.subheader("🔥 Customer Path Heatmap")
    heatmap_path = os.path.join(DATA_DIR, 'heatmap.png')
    if os.path.exists(heatmap_path):
        st.image(heatmap_path, caption="Accumulated Store Traffic Intensity Heatmap", use_container_width=True)
    else:
        st.info("Heatmap not generated yet.")

st.divider()

st.subheader("🤖 AI Movement Prediction")
st.markdown("<p style='color: #94a3b8;'>Predicting the next likely zone for a customer currently in a given zone based on past traffic sequences using an Advanced XGBoost Model.</p>", unsafe_allow_html=True)

predictor = MovementPredictor()
is_trained = predictor.train()

if is_trained:
    zone_options = traffic_df['zone'].tolist() if not traffic_df.empty else []
    if zone_options:
        with st.container(border=True):
            st.markdown("#### Predict Customer Journey")
            pred_col1, pred_col2 = st.columns([3, 1])
            with pred_col1:
                selected_zone = st.selectbox("Select Current Zone", zone_options, label_visibility="collapsed")
            with pred_col2:
                predict_clicked = st.button("🔮 Predict Next Move", use_container_width=True)
                
            if predict_clicked:
                prediction = predictor.predict_next_zone(selected_zone)
                st.info(f"Based on historical data, a customer in **{selected_zone}** is most likely to move to: **{prediction}** next.")
else:
    st.warning("Insufficient data to train prediction model. Run the video pipeline to gather more data.")

st.divider()

st.subheader("💡 Automated Store Insights")
st.markdown("<p style='color: #94a3b8;'>Our script monitors the statistics and provides high-level contextual reasoning for the analyst.</p>", unsafe_allow_html=True)

agent = RetailOptimizationAgent()
insights = agent.generate_recommendations()

if insights and "analyst_insights" in insights:
    for logic in insights["analyst_insights"]:
        st.info(logic)

st.divider()
st.subheader("Data Export")
if not detailed_dwell_df.empty:
    csv = detailed_dwell_df.to_csv(index=False).encode('utf-8')
    st.download_button("Download Raw Dwell Data (CSV)", csv, "dwell_data.csv", "text/csv")

st.divider()
auto_refresh = st.checkbox("Enable Auto-Refresh", value=True)
if auto_refresh:
    import time
    time.sleep(3)
    st.rerun()
