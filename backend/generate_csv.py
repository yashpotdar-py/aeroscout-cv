import os
import pandas as pd
import numpy as np

def main():
    # Center
    LAT_C = 26.4499
    LON_C = 79.4038

    # Dimensions
    LAT_SPAN = 0.045
    LON_SPAN = 0.051
    PASSES = 8
    ROWS = 600

    # Box corners
    lat_top = LAT_C + LAT_SPAN / 2
    lat_bot = LAT_C - LAT_SPAN / 2
    lon_left = LON_C - LON_SPAN / 2
    lon_right = LON_C + LON_SPAN / 2

    # Waypoints
    waypoints = []
    lat_spacing = LAT_SPAN / (PASSES - 1)
    for i in range(PASSES):
        lat = lat_top - i * lat_spacing
        if i % 2 == 0:
            # Eastbound
            waypoints.append((lat, lon_left))
            waypoints.append((lat, lon_right))
        else:
            # Westbound
            waypoints.append((lat, lon_right))
            waypoints.append((lat, lon_left))

    # Calculate cumulative distance for interpolation
    def dist(p1, p2):
        return np.hypot(p1[0]-p2[0], p1[1]-p2[1])

    dists = [0]
    for i in range(1, len(waypoints)):
        dists.append(dists[-1] + dist(waypoints[i-1], waypoints[i]))

    total_dist = dists[-1]
    
    # Interpolate points
    interp_dists = np.linspace(0, total_dist, ROWS)
    lats = np.interp(interp_dists, dists, [p[0] for p in waypoints])
    lons = np.interp(interp_dists, dists, [p[1] for p in waypoints])

    # Build dataframe
    df = pd.DataFrame({
        "time(millisecond)": np.arange(ROWS) * 100,
        "latitude": lats,
        "longitude": lons,
        "altitude(feet)": 393.701,
        "speed(mph)": 17.895,
        "satellites": 14,
        "isVideo": 1,
    })

    # Battery and voltage
    df["battery_percent"] = np.maximum(85.0 - np.arange(ROWS) * 0.025, 5.0)
    df["voltage(v)"] = np.maximum(15.2 - np.arange(ROWS) * 0.003, 14.0)

    # Compass heading
    headings = []
    for i in range(ROWS):
        if i < ROWS - 1:
            dlon = df.loc[i+1, "longitude"] - df.loc[i, "longitude"]
            if dlon > 1e-6:
                h = 90
            elif dlon < -1e-6:
                h = 270
            else:
                h = headings[-1] if headings else 90
        else:
            h = headings[-1] if headings else 90
        headings.append(h)

    df["compass_heading(degrees)"] = headings

    os.makedirs("demo_data", exist_ok=True)
    out_path = os.path.join("demo_data", "flight_log.csv")
    
    # Reorder columns to match original if needed
    cols = [
        "time(millisecond)", "latitude", "longitude", "altitude(feet)",
        "compass_heading(degrees)", "speed(mph)", "satellites",
        "battery_percent", "isVideo", "voltage(v)"
    ]
    df = df[cols]
    
    # Round to specific decimals like original script
    df["latitude"] = df["latitude"].round(8)
    df["longitude"] = df["longitude"].round(8)
    df["altitude(feet)"] = df["altitude(feet)"].round(3)
    df["compass_heading(degrees)"] = df["compass_heading(degrees)"].round(2)
    df["speed(mph)"] = df["speed(mph)"].round(3)
    df["battery_percent"] = df["battery_percent"].round(3)
    df["voltage(v)"] = df["voltage(v)"].round(4)
    
    df.to_csv(out_path, index=False)

    print(df[["latitude", "longitude"]].head(3))
    print(f"Lat range: {df['latitude'].min():.4f} to {df['latitude'].max():.4f}")
    print(f"Lon range: {df['longitude'].min():.4f} to {df['longitude'].max():.4f}")

if __name__ == "__main__":
    main()
