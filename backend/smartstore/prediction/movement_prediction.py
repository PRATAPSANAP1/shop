import pandas as pd
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
import sqlite3
import numpy as np
from utils.config import DB_PATH

class MovementPredictor:
    def __init__(self):
        self.model = XGBClassifier(
            n_estimators=300, 
            learning_rate=0.05,
            max_depth=6,
            colsample_bytree=0.8,
            random_state=42,
            eval_metric='mlogloss'
        )
        self.le_zone = LabelEncoder()
        self.is_trained = False

    def fetch_training_data(self):
        """
        Fetches sequence of zones visited by customers to build training data.
        X = current_zone, y = next_zone.
        In a real scenario, this would include time of day, dwell time, etc.
        """
        conn = sqlite3.connect(DB_PATH)
        query = '''
        SELECT track_id, zone, timestamp
        FROM trajectories
        WHERE zone IS NOT NULL
        ORDER BY track_id, timestamp
        '''
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        if not df.empty:
            # Keep only the rows where the zone changes for a given track_id
            # This extracts the actual sequence of movements
            df['prev_zone'] = df.groupby('track_id')['zone'].shift()
            df = df[df['zone'] != df['prev_zone']].drop(columns=['prev_zone']).copy()
            
        return df

    def train(self):
        df = self.fetch_training_data()
        if df.empty or len(df) < 10: # Need enough data
            return False

        # Create sequential data: current_zone -> next_zone
        df['next_zone'] = df.groupby('track_id')['zone'].shift(-1)
        df.dropna(subset=['next_zone'], inplace=True)
        
        if df.empty:
            return False

        # Encode categorical variables
        df['zone_encoded'] = self.le_zone.fit_transform(df['zone'])
        df['next_zone_encoded'] = self.le_zone.transform(df['next_zone'])

        X = df[['zone_encoded']]
        y = df['next_zone_encoded']

        self.model.fit(X, y)
        self.is_trained = True
        return True

    def predict_next_zone(self, current_zone):
        if not self.is_trained:
            # Attempt to train on the fly
            success = self.train()
            if not success:
                return "Insufficient Data"

        try:
            curr_enc = self.le_zone.transform([current_zone])[0]

            # Get probabilities
            probs = self.model.predict_proba([[curr_enc]])[0]
            classes = self.model.classes_

            # Force probability of staying in the current zone to 0
            if curr_enc in classes:
                curr_idx = np.where(classes == curr_enc)[0]
                if len(curr_idx) > 0:
                    probs[curr_idx[0]] = 0.0

            # If all probabilities are 0 (e.g. it only ever stayed in this zone)
            if np.sum(probs) == 0:
                return "Unknown (No exit data)"

            # Predict the most likely different zone
            best_idx = np.argmax(probs)
            pred_enc = classes[best_idx]
            pred_zone = self.le_zone.inverse_transform([pred_enc])[0]
            
            # Normalize confidence among remaining options
            confidence = (probs[best_idx] / np.sum(probs)) * 100
            
            return f"{pred_zone} ({confidence:.1f}% confidence)"
        except Exception as e:
            return f"Unknown (Error: {e})"
