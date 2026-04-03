import psycopg2
from psycopg2.extras import execute_values
from openpyxl import load_workbook

EXCEL_PATH = "masuot-data.xlsx"

def get_connection():
    return psycopg2.connect(
        host="aws-1-ap-northeast-1.pooler.supabase.com",
        port=5432,
        database="postgres",
        user="postgres.jhkxyiiwtxtgqxovljkl",
        password="__Por@t2019!"
    )

# =========================
# CREATE TABLES
# =========================
def create_tables(conn):
    with conn.cursor() as cur:

        cur.execute("DROP TABLE IF EXISTS members;")

        cur.execute("""
        CREATE TABLE members (
            id SERIAL PRIMARY KEY,
            budget_code TEXT,
            first_name TEXT,
            last_name TEXT,
            age INTEGER
        );
        """)

    conn.commit()

# =========================
# IMPORT MEMBERS (🔥 זה החסר)
# =========================
def import_members(conn, wb):
    sheet = wb["חברים"]

    rows_to_insert = []

    for row in sheet.iter_rows(min_row=2, values_only=True):

        first_name = row[3]   # D
        last_name = row[2]    # C
        age = row[6]          # G
        budget_code = row[7]  # קוד תקציב

        if not budget_code or not str(budget_code).isdigit():
            continue

        if not first_name or not last_name:
            continue

        rows_to_insert.append((
            str(budget_code),
            str(first_name),
            str(last_name),
            int(age) if age else None
        ))

    if not rows_to_insert:
        print("❌ לא נמצאו חברים")
        return

    with conn.cursor() as cur:
        execute_values(
            cur,
            """
            INSERT INTO members (budget_code, first_name, last_name, age)
            VALUES %s
            """,
            rows_to_insert
        )

    conn.commit()
    print(f"✅ inserted {len(rows_to_insert)} members")

# =========================
# MAIN
# =========================
def main():
    conn = get_connection()
    wb = load_workbook(EXCEL_PATH, data_only=True)

    create_tables(conn)
    import_members(conn, wb)

    conn.close()
    print("🎉 DONE")

if __name__ == "__main__":
    main()