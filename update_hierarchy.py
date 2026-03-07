import csv
import json
import os

# Sahi paths set karein
csv_path = r'D:\EMS_PRO_SYSTEM\backend\master_data_utf8.csv.csv'
json_path = r'D:\EMS_PRO_SYSTEM\frontend\public\hierarchy.json'

zone_dist = {}
dist_ac = {}

if not os.path.exists(csv_path):
    print(f"Error: CSV file nahi mili is path par: {csv_path}")
else:
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            zone = row['Zone_Name']
            dist = row['DISTRICT_NAME_EN']
            ac = row['AC_NAME_EN'].strip()
            reserve = row['RESERVE_EN'].strip()

            # Zone to District mapping
            if zone not in zone_dist:
                zone_dist[zone] = set()
            zone_dist[zone].add(dist)

            # District to Constituency mapping
            if dist not in dist_ac:
                dist_ac[dist] = []
            
            # Duplicate AC seats se bachne ke liye
            if not any(item['name'] == ac for item in dist_ac[dist]):
                dist_ac[dist].append({"name": ac, "type": reserve})

    # Data ko final format mein convert karein
    final_data = {
        "zones": {z: sorted(list(d)) for z, d in zone_dist.items()},
        "districts": dist_ac
    }

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
    
    print(f"Balle Balle! Sabhi 15 Zones, 75 Districts aur 403 Seats update ho gayi hain.")
    print(f"File location: {json_path}")