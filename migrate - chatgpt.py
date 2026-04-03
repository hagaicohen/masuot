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

        cur.execute("DROP TABLE IF EXISTS salaries;")
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

        cur.execute("""
        CREATE TABLE salaries (
            id SERIAL PRIMARY KEY,
            budget_code TEXT,
            first_name TEXT,
            last_name TEXT,
            net_amount NUMERIC
        );
        """)

    conn.commit()

# =========================
# IMPORT MEMBERS
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
            str(first_name).strip(),
            str(last_name).strip(),
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
# IMPORT SALARIES 🔥 חדש
# =========================
def import_salaries(conn, wb):
    sheet = wb["הכנסות שכר "]

    rows_to_insert = []

    for row in sheet.iter_rows(min_row=2, values_only=True):

        first_name = row[1]   # תעדכן אם צריך
        last_name = row[2]
        budget_code = row[0]

        net_amount = row[6]           # סכום נטו
        #net_amount_updated = row[6]   # סכום נטו חדש

        if not budget_code or not str(budget_code).isdigit():
            continue

        if not first_name or not last_name:
            continue

        rows_to_insert.append((
            str(budget_code),
            str(first_name).strip(),
            str(last_name).strip(),
            float(net_amount) if net_amount else 0,
            #float(net_amount_updated) if net_amount_updated else 0
        ))

    if not rows_to_insert:
        print("❌ לא נמצאו משכורות")
        return

    with conn.cursor() as cur:
        execute_values(
            cur,
            """
            INSERT INTO salaries (budget_code, first_name, last_name, net_amount)
            VALUES %s
            """,
            rows_to_insert
        )

    conn.commit()
    print(f"✅ inserted {len(rows_to_insert)} salaries")

# =========================
# MAIN
# =========================
def main():
    conn = get_connection()
    wb = load_workbook(EXCEL_PATH, data_only=True)

    create_tables(conn)

    import_members(conn, wb)
    import_salaries(conn, wb)  # 🔥 חדש

    conn.close()
    print("🎉 DONE")

if __name__ == "__main__":
    main()