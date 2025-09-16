import pandas as pd
import numpy as np
import json
from sklearn.ensemble import RandomForestRegressor
from datetime import timedelta
import os

def predict_traffic(file_path, future_days):
    try:
        df = pd.read_csv(file_path, parse_dates=['date'])
        df['day_index'] = range(len(df))

        X = df[['day_index']]
        y = df['traffic_volume']

        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X, y)

        future_indexes = np.arange(len(df), len(df) + future_days).reshape(-1, 1)
        future_dates = [df['date'].max() + timedelta(days=i + 1) for i in range(future_days)]
        predictions = model.predict(future_indexes)

        result = [
            {"date": str(future_dates[i].date()), "prediction": int(predictions[i])}
            for i in range(future_days)
        ]

        return result
    except Exception as e:
        return {"error": str(e)}

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, "traffic_data.csv")
    output = predict_traffic(file_path, 7)
    print(json.dumps(output))  # ✅ CORRECTION ICI
