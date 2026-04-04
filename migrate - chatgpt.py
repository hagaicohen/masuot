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
# HELPERS
# =========================
def safe_int(value):
    try:
        return int(float(value))
    except:
        return 0


def safe_float(value):
    try:
        return float(value)
    except:
        return 0


def clean(value):
    if not value:
        return ""
    return str(value).replace("\n", " ").strip()


# =========================
# CREATE / ALTER TABLES
# =========================
def create_tables(conn):
    with conn.cursor() as cur:

        cur.execute("""
        CREATE TABLE IF NOT EXISTS families (
            budget_code TEXT PRIMARY KEY
        );
        """)

        cur.execute("ALTER TABLE families ADD COLUMN IF NOT EXISTS family_name TEXT;")
        cur.execute("ALTER TABLE families ADD COLUMN IF NOT EXISTS family_size INTEGER;")
        cur.execute("ALTER TABLE families ADD COLUMN IF NOT EXISTS family_standard NUMERIC;")

        # income
        cur.execute("ALTER TABLE families ADD COLUMN IF NOT EXISTS pension NUMERIC;")
        cur.execute("ALTER TABLE families ADD COLUMN IF NOT EXISTS survivors NUMERIC;")
        cur.execute("ALTER TABLE families ADD COLUMN IF NOT EXISTS old_age_allowance NUMERIC;")
        cur.execute("ALTER TABLE families ADD COLUMN IF NOT EXISTS child_allowance NUMERIC;")

        cur.execute("ALTER TABLE families ADD COLUMN IF NOT EXISTS flow_income NUMERIC;")
        cur.execute("ALTER TABLE families ADD COLUMN IF NOT EXISTS health_cost NUMERIC;")

        # 🔥 שדות מהאקסל
        cur.execute("ALTER TABLE families ADD COLUMN IF NOT EXISTS budget_distribution NUMERIC;")  # P
        cur.execute("ALTER TABLE families ADD COLUMN IF NOT EXISTS special_help NUMERIC;")        # Q
        cur.execute("ALTER TABLE families ADD COLUMN IF NOT EXISTS periodic_grant NUMERIC;")      # R
        cur.execute("ALTER TABLE families ADD COLUMN IF NOT EXISTS personal_bonus NUMERIC;")      # S
        cur.execute("ALTER TABLE families ADD COLUMN IF NOT EXISTS women_work_benefit NUMERIC;")  # T
        cur.execute("ALTER TABLE families ADD COLUMN IF NOT EXISTS travel NUMERIC;")              # U

        # members
        cur.execute("""
        CREATE TABLE IF NOT EXISTS members (
            id SERIAL PRIMARY KEY,
            budget_code TEXT,
            first_name TEXT,
            last_name TEXT,
            age INTEGER
        );
        """)

        # salary
        cur.execute("""
        CREATE TABLE IF NOT EXISTS salary_income (
            id SERIAL PRIMARY KEY,
            budget_code TEXT,
            first_name TEXT,
            last_name TEXT,
            amount NUMERIC
        );
        """)

        cur.execute("ALTER TABLE salary_income ADD COLUMN IF NOT EXISTS study_fund NUMERIC;")
        cur.execute("ALTER TABLE salary_income ADD COLUMN IF NOT EXISTS pension_extra NUMERIC;")

        # rules
        cur.execute("""
        CREATE TABLE IF NOT EXISTS rules (
            key TEXT PRIMARY KEY,
            value NUMERIC
        );
        """)

    conn.commit()


# =========================
# IMPORT FAMILIES
# =========================
def import_families(conn, wb):
    sheet = wb["ריכוז נתונים"]

    rows = []

    for row in sheet.iter_rows(min_row=2, values_only=True):

        budget_code = row[0]

        if not budget_code or not str(budget_code).isdigit():
            continue

        rows.append((
            str(budget_code),
            clean(row[1]),
            safe_int(row[2]),
            safe_float(row[14]),

            # income
            safe_float(row[24]),
            safe_float(row[25]),
            safe_float(row[26]),
            safe_float(row[27]),

            safe_float(row[31]),
            safe_float(row[41]),

            # 🔥 P-Q-R-S-T-U
            safe_float(row[15]),  # P
            safe_float(row[16]),  # Q
            safe_float(row[17]),  # R
            safe_float(row[18]),  # S
            safe_float(row[19]),  # T
            safe_float(row[20])   # U
        ))

    with conn.cursor() as cur:
        execute_values(
            cur,
            """
            INSERT INTO families (
                budget_code, family_name, family_size, family_standard,
                pension, survivors, old_age_allowance, child_allowance,
                flow_income, health_cost,
                budget_distribution, special_help, periodic_grant,
                personal_bonus, women_work_benefit, travel
            )
            VALUES %s
            ON CONFLICT (budget_code) DO UPDATE SET
                family_name = EXCLUDED.family_name,
                family_size = EXCLUDED.family_size,
                family_standard = EXCLUDED.family_standard,
                pension = EXCLUDED.pension,
                survivors = EXCLUDED.survivors,
                old_age_allowance = EXCLUDED.old_age_allowance,
                child_allowance = EXCLUDED.child_allowance,
                flow_income = EXCLUDED.flow_income,
                health_cost = EXCLUDED.health_cost,
                budget_distribution = EXCLUDED.budget_distribution,
                special_help = EXCLUDED.special_help,
                periodic_grant = EXCLUDED.periodic_grant,
                personal_bonus = EXCLUDED.personal_bonus,
                women_work_benefit = EXCLUDED.women_work_benefit,
                travel = EXCLUDED.travel
            """,
            rows
        )

    conn.commit()
    print(f"✅ inserted/updated {len(rows)} families")


# =========================
# MAIN
# =========================
def main():
    conn = get_connection()
    wb = load_workbook(EXCEL_PATH, data_only=True)

    create_tables(conn)
    import_families(conn, wb)

    conn.close()
    print("🎉 DONE")


if __name__ == "__main__":
    main()