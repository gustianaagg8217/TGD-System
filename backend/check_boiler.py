import sqlite3

conn = sqlite3.connect('tgd_system_phase1.db')
cursor = conn.cursor()

# Check if Boiler exists
cursor.execute('SELECT id, name, type, status FROM assets WHERE name LIKE "%Boiler%"')
results = cursor.fetchall()

print("=== Assets with 'Boiler' in name ===")
if results:
    for row in results:
        print(f"ID: {row[0]}, Name: {row[1]}, Type: {row[2]}, Status: {row[3]}")
else:
    print("❌ No Boiler found in database")

# Check all asset types
print("\n=== All asset types in database ===")
cursor.execute('SELECT DISTINCT type FROM assets ORDER BY type')
types = cursor.fetchall()
for type_row in types:
    print(f"  - {type_row[0]}")

conn.close()
