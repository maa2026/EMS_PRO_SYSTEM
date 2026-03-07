import pymongo
from datetime import datetime

try:
    client = pymongo.MongoClient("mongodb://localhost:27017/")
    db = client["ems_up"]
    workers_col = db["workers"]

    mainpuri_demo_data = [
        {
            "fullName": "Yogesh Yadav",
            "mobile": "9876543210",
            "role": "Booth Manager",
            "zone": "Upper Ganga–Kali Belt",
            "district": "Mainpuri",
            "constituency": "Karhal",
            "boothNumber": "15",
            "status": "VERIFIED",
            "joinedAt": datetime.now()
        },
        {
            "fullName": "Sushil Kumar",
            "mobile": "9988776655",
            "role": "Booth President",
            "zone": "Upper Ganga–Kali Belt",
            "district": "Mainpuri",
            "constituency": "Mainpuri",
            "boothNumber": "102",
            "status": "VERIFIED",
            "joinedAt": datetime.now()
        },
        {
            "fullName": "Ram Lakhan",
            "mobile": "9000111222",
            "role": "Jan Sampark Sathi",
            "zone": "Upper Ganga–Kali Belt",
            "district": "Mainpuri",
            "constituency": "Bhongaon",
            "boothNumber": "245",
            "status": "VERIFIED",
            "joinedAt": datetime.now()
        },
        {
            "fullName": "Vikas Diwakar",
            "mobile": "9122334455",
            "role": "Booth Manager",
            "zone": "Upper Ganga–Kali Belt",
            "district": "Mainpuri",
            "constituency": "Kishni",
            "boothNumber": "310",
            "status": "VERIFIED",
            "joinedAt": datetime.now()
        }
    ]

    result = workers_col.insert_many(mainpuri_demo_data)
    print(f"Done! {len(result.inserted_ids)} workers added to Mainpuri.")

except Exception as e:
    print(f"Error: {e}")
