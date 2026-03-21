import pandas as pd
from analytics.zone_analysis import get_zone_traffic_stats
from analytics.dwell_time_analysis import calculate_dwell_times

class RetailOptimizationAgent:
    """
    An Agentic AI layer for SmartStore. 
    This agent autonomously perceives store data, reasons about customer behavior
    anomalies (e.g., traffic vs dwell time disparities), and generates actionable
    decisions for both data analysts and shopkeepers.
    """
    def __init__(self):
        # 1. Perception: The agent reads current world state from analytics
        self.traffic_df = get_zone_traffic_stats()
        self.dwell_df, _ = calculate_dwell_times()
        
    def analyze_zone_traffic(self):
        """
        2. Reasoning (Data Processing): Evaluates raw counts into contextual insights.
        """
        if self.traffic_df.empty or self.dwell_df.empty:
            return None
             
        # Extract basic metrics
        total_visitors = self.traffic_df['visitors'].sum()
        busiest_zone = self.traffic_df.iloc[0]['zone']
        lowest_traffic_zone = self.traffic_df.iloc[-1]['zone']
        
        highest_dwell_zone = self.dwell_df.iloc[0]['zone']
        
        # Calculate average dwell strictly for zones with data
        if not self.dwell_df.empty and 'avg_dwell_time_seconds' in self.dwell_df:
            avg_store_dwell = round(self.dwell_df['avg_dwell_time_seconds'].mean(), 1)
        else:
            avg_store_dwell = 0
            
        return {
            "total_visitors": total_visitors,
            "busiest_zone": busiest_zone,
            "lowest_traffic_zone": lowest_traffic_zone,
            "highest_dwell_zone": highest_dwell_zone,
            "avg_store_dwell": avg_store_dwell
        }

    def detect_low_traffic_zones(self):
        """
        2. Reasoning (Pattern Recognition): Identifies sections that are struggling.
        """
        analysis = self.analyze_zone_traffic()
        if not analysis:
            return None
        return analysis["lowest_traffic_zone"]

    def generate_recommendations(self):
        """
        3. Decision Making & Action: The agent formulates strategic directives 
        tailored to different audiences (Analytics vs Shopkeeper).
        """
        analysis = self.analyze_zone_traffic()
        
        if not analysis:
            return {
                "analyst_insights": ["Waiting for sufficient data to formulate agentic analysis."],
                "shopkeeper_insights": ["Gathering more store observations..."]
            }

        busiest = analysis["busiest_zone"]
        lowest = analysis["lowest_traffic_zone"]
        dwell = analysis["highest_dwell_zone"]

        analyst_insights = []
        shopkeeper_insights = []

        # Logic Rule 1: High traffic vs. High Dwell
        if busiest != dwell:
            analyst_insights.append(
                f"**Data Mismatch**: '{busiest}' gets the most foot traffic, "
                f"but people spend more time in '{dwell}'. This means customers "
                f"are just walking past {busiest} without stopping."
            )
            shopkeeper_insights.append(
                f"**Suggestion**: Try moving your popular snacks from {dwell} "
                f"over to {busiest} so more people see them."
            )
        else:
            analyst_insights.append(
                f"**Good Layout**: '{busiest}' has both the highest "
                f"traffic and the highest dwell time. The current layout here is working well."
            )
            shopkeeper_insights.append(
                f"**Success**: The {busiest} is performing great today! Keep promoting items there."
            )

        # Logic Rule 2: Low Traffic formatting
        analyst_insights.append(
            f"**Dead Zone Detected**: The '{lowest}' zone barely gets any customers. "
            f"We might need to redesign this area or make it more visible."
        )
        shopkeeper_insights.append(
            f"**Suggestion**: Not many people are visiting {lowest}. Try putting some essential items near its entrance."
        )

        # Logic Rule 3: Congestion / Queuing
        if analysis["avg_store_dwell"] > 180 and analysis["total_visitors"] > 10:
             analyst_insights.append(
                 f"**High Congestion**: The average wait time is {analysis['avg_store_dwell']} seconds. "
                 f"Coupled with high traffic, there's probably a long queue forming."
             )
             shopkeeper_insights.append(
                 "**Action Needed**: The store is getting crowded. Consider opening another checkout register!"
             )

        return {
            "analyst_insights": analyst_insights,
            "shopkeeper_insights": shopkeeper_insights
        }

    def create_daily_store_insight_report(self):
        """
        4. Output: Compiles Agent findings into a readable markdown report.
        """
        analysis = self.analyze_zone_traffic()
        if not analysis:
            return "No data available to generate Daily Retail Insight Report."

        recs = self.generate_recommendations()
        
        report = f"""
### 📝 Daily Summary Report
*Generated by our Background Script*

* **Total Visitors**: {analysis['total_visitors']}
* **Busiest Zone**: {analysis['busiest_zone']}
* **Lowest Traffic Zone**: {analysis['lowest_traffic_zone']}
* **Average Dwell Time**: {analysis['avg_store_dwell']} seconds

#### Summary:
{recs['shopkeeper_insights'][0]} {recs['shopkeeper_insights'][1]}
"""
        return report

# Global getter for backwards compatibility
def get_agent_recommendations():
    agent = RetailOptimizationAgent()
    return agent.generate_recommendations()
