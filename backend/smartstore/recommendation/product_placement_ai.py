from analytics.dwell_time_analysis import calculate_dwell_times
from analytics.zone_analysis import get_zone_traffic_stats

def generate_recommendations():
    """
    Generates rule-based product placement recommendations based on
    dwell time and overall traffic.
    """
    traffic_df = get_zone_traffic_stats()
    dwell_df, _ = calculate_dwell_times()

    recommendations = []

    if traffic_df.empty or dwell_df.empty:
        return ["Not enough data to formulate recommendations yet."]

    # 1. Identify highest traffic zone
    top_traffic_zone = traffic_df.iloc[0]['zone']
    # 2. Identify lowest traffic zone
    low_traffic_zone = traffic_df.iloc[-1]['zone']
    # 3. Identify highest dwell time zone
    top_dwell_zone = dwell_df.iloc[0]['zone']

    # Generate insights
    recommendations.append(f"**Highlight**: {top_traffic_zone} is the busiest section.")
    
    if top_traffic_zone != top_dwell_zone:
        recommendations.append(
            f"**Action**: Consider moving high-margin impulse items from {top_dwell_zone} "
            f"(high dwell time) closer to {top_traffic_zone} (high traffic) to increase conversion."
        )

    recommendations.append(
        f"**Action**: Drive traffic to {low_traffic_zone} (lowest visits) by placing "
        "essential or promotional items near its entrance."
    )

    return recommendations
