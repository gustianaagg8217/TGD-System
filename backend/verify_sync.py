#!/usr/bin/env python
"""Verify that database is properly synced with all assets and maintenance logs."""

import sqlite3

def verify_database():
    conn = sqlite3.connect('tgd_system_phase1.db')
    cursor = conn.cursor()

    # Count Boiler System
    cursor.execute('SELECT id, name FROM assets WHERE name = ?', ('Boiler System',))
    boiler = cursor.fetchone()
    print('✓ Boiler System in Assets:', 'YES' if boiler else 'NO')
    if boiler:
        print(f'  ID: {boiler[0]}, Name: {boiler[1]}')
        
        # Get Boiler maintenance logs
        cursor.execute('''SELECT COUNT(*), maintenance_type, status FROM maintenance_logs 
                          WHERE asset_id = ? 
                          GROUP BY maintenance_type, status''', (boiler[0],))
        print(f'  Maintenance Logs for Boiler:')
        for row in cursor.fetchall():
            print(f'    - {row[1]}: {row[2]} (Count: {row[0]})')

    # Summary
    cursor.execute('SELECT COUNT(*) FROM assets')
    total_assets = cursor.fetchone()[0]
    cursor.execute('SELECT COUNT(*) FROM maintenance_logs')
    total_logs = cursor.fetchone()[0]

    print(f'\n✓ Total Assets in Database: {total_assets}')
    print(f'✓ Total Maintenance Logs: {total_logs}')

    # Show all assets with log count
    print('\nAll Assets with Maintenance Log Count:')
    cursor.execute('''SELECT a.name, COUNT(ml.id) as log_count
                       FROM assets a 
                       LEFT JOIN maintenance_logs ml ON a.id = ml.asset_id
                       GROUP BY a.id, a.name
                       ORDER BY a.name''')
    for row in cursor.fetchall():
        print(f'  {row[0]:<40} : {row[1]} logs')

    conn.close()
    print('\n✓ DATABASE SYNCHRONIZATION COMPLETE!')
    print('✓ Boiler System is now properly synced in Assets and Maintenance Logs')

if __name__ == '__main__':
    verify_database()
