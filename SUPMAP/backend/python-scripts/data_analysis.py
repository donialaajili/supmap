import pandas as pd

def analyze_traffic(file_path):
    try:
        df = pd.read_csv(file_path, parse_dates=['date'])

        stats = {
            "global_average": round(df['traffic_volume'].mean(), 2),
            "max_traffic": int(df['traffic_volume'].max()),
            "min_traffic": int(df['traffic_volume'].min()),
            "traffic_by_day": df.groupby(df['date'].dt.day_name())['traffic_volume'].mean().to_dict(),
            "traffic_by_date": df.groupby(df['date'].dt.date)['traffic_volume'].sum().to_dict()
        }

        return stats
    except Exception as e:
        return {"error": str(e)}

if __name__ == '__main__':
    print(analyze_traffic("traffic_data.csv"))
