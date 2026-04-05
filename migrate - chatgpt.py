import psycopg2
from psycopg2.extras import execute_values
from openpyxl import load_workbook

EXCEL_PATH = "masuot-data.xlsx"

def connect():
    return psycopg2.connect(
        host="aws-1-ap-northeast-1.pooler.supabase.com",
        port=5432,
        database="postgres",
        user="postgres.jhkxyiiwtxtgqxovljkl",
        password="__Por@t2019!")


def to_num(v):
    try:
        return float(v)
    except:
        return 0

def is_valid_code(v):
    return v and str(v).strip().isdigit()

def add_column_if_not_exists(cur, table, column):
    cur.execute(f"""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='{table}' AND column_name='{column}'
            ) THEN
                ALTER TABLE {table} ADD COLUMN {column} NUMERIC;
            END IF;
        END$$;
    """)

def main():
    conn = connect()
    cur = conn.cursor()

    wb = load_workbook(EXCEL_PATH, data_only=True)

    summary = wb["ריכוז נתונים"]
    members_sheet = wb["חברים"]
    salary_sheet = wb["הכנסות שכר "]
    discount_sheet = wb["הנחות "]

    print("Ensuring schema...")

    add_column_if_not_exists(cur, "families", "community_tax")
    add_column_if_not_exists(cur, "families", "municipal_tax")
    add_column_if_not_exists(cur, "families", "arnona")
    add_column_if_not_exists(cur, "families", "income_for_standard")

    add_column_if_not_exists(cur, "families", "health_total")
    add_column_if_not_exists(cur, "families", "health_0_50")
    add_column_if_not_exists(cur, "families", "health_50_70")
    add_column_if_not_exists(cur, "families", "health_70_plus")

    add_column_if_not_exists(cur, "families", "toddlers")
    add_column_if_not_exists(cur, "families", "kindergarten")
    add_column_if_not_exists(cur, "families", "elementary")
    add_column_if_not_exists(cur, "families", "middle")
    add_column_if_not_exists(cur, "families", "high")

    add_column_if_not_exists(cur, "families", "hishtalmut_fund")
    add_column_if_not_exists(cur, "families", "pension_contribution")

    print("Cleaning tables...")
    cur.execute("TRUNCATE TABLE members RESTART IDENTITY CASCADE")
    cur.execute("TRUNCATE TABLE families CASCADE")
    cur.execute("TRUNCATE TABLE rules CASCADE")

    # =========================
    # SAVINGS
    # =========================
    hishtalmut_map = {}
    pension_map = {}

    for row in salary_sheet.iter_rows(min_row=9):
        b = row[0].value
        if not is_valid_code(b):
            continue

        b = str(b).strip()

        hishtalmut = to_num(row[14].value)
        pension = to_num(row[15].value)

        hishtalmut_map[b] = hishtalmut_map.get(b, 0) + hishtalmut
        pension_map[b] = pension_map.get(b, 0) + pension

    # =========================
    # FAMILIES
    # =========================
    families_data = []

    for row in summary.iter_rows(min_row=2):
        code = row[0].value
        name = row[1].value

        if not is_valid_code(code):
            continue
        if name and "סיכום" in str(name):
            continue

        code = str(code).strip()

        families_data.append((
            code,
            name,
            to_num(row[14].value),
            to_num(row[29].value),

            to_num(row[15].value),
            to_num(row[18].value),
            to_num(row[19].value),
            to_num(row[20].value),
            to_num(row[17].value),
            to_num(row[16].value),
            to_num(row[21].value),
            to_num(row[24].value),
            to_num(row[25].value),
            to_num(row[26].value),
            to_num(row[27].value),

            to_num(row[45].value),
            to_num(row[46].value),
            to_num(row[47].value),

            to_num(row[37].value),
            to_num(row[38].value),
            to_num(row[39].value),
            to_num(row[40].value),

            to_num(row[7].value),
            to_num(row[8].value),
            to_num(row[9].value),
            to_num(row[10].value),
            to_num(row[11].value),

            hishtalmut_map.get(code, 0),
            pension_map.get(code, 0)
        ))

    execute_values(cur, """
        INSERT INTO families (
            budget_code,
            family_name,
            family_standard,
            income_for_standard,
            budget_distribution,
            personal_bonus,
            women_work_benefit,
            travel,
            periodic_grant,
            special_help,
            current_state,
            pension,
            survivors,
            old_age_allowance,
            child_allowance,
            community_tax,
            municipal_tax,
            arnona,

            health_total,
            health_0_50,
            health_50_70,
            health_70_plus,

            toddlers,
            kindergarten,
            elementary,
            middle,
            high,

            hishtalmut_fund,
            pension_contribution
        ) VALUES %s
    """, families_data)

    print("Families:", len(families_data))

    # =========================
    # 🔥 RULES (FINAL CORRECT)
    # =========================
    print("Rebuilding rules...")

    cur.execute("DROP TABLE IF EXISTS rules")

    cur.execute("""
    CREATE TABLE rules (
        key TEXT PRIMARY KEY,

        nursery NUMERIC,
        kindergarten NUMERIC,
        "primary" NUMERIC,
        middle NUMERIC,
        highschool NUMERIC,

        health_total NUMERIC,
        health_0_50 NUMERIC,
        health_50_70 NUMERIC,
        health_70_plus NUMERIC,

        K5 NUMERIC,
        L5 NUMERIC,
        K6 NUMERIC,
        J6 NUMERIC,
        L6 NUMERIC,
        M5 NUMERIC,
        K7 NUMERIC,
        J7 NUMERIC,
        L7 NUMERIC,
        M6 NUMERIC,

        F16 NUMERIC,
        F21 NUMERIC
    )
    """)

    # 🔥 לוקחים שורה ראשונה אמיתית מה-summary
    row = next(summary.iter_rows(min_row=1))

    cur.execute("""
    INSERT INTO rules VALUES (%s, %s, %s, %s, %s, %s,
                             %s, %s, %s, %s,
                             %s, %s, %s, %s, %s, %s,
                             %s, %s, %s, %s,
                             %s, %s)
    """, (
        "default",

        # חינוך
        to_num(row[7].value),
        to_num(row[8].value),
        to_num(row[9].value),
        to_num(row[10].value),
        to_num(row[11].value),

        # בריאות
        to_num(row[37].value),
        to_num(row[38].value),
        to_num(row[39].value),
        to_num(row[40].value),

        # מדרגות
        to_num(discount_sheet.cell(row=5, column=11).value),
        to_num(discount_sheet.cell(row=5, column=12).value),
        to_num(discount_sheet.cell(row=6, column=11).value),
        to_num(discount_sheet.cell(row=6, column=10).value),
        to_num(discount_sheet.cell(row=6, column=12).value),
        to_num(discount_sheet.cell(row=5, column=13).value),

        to_num(discount_sheet.cell(row=7, column=11).value),
        to_num(discount_sheet.cell(row=7, column=10).value),
        to_num(discount_sheet.cell(row=7, column=12).value),
        to_num(discount_sheet.cell(row=6, column=13).value),

        # חשובים
        to_num(discount_sheet.cell(row=16, column=6).value),
        to_num(discount_sheet.cell(row=21, column=6).value)
    ))

    print("Rules rebuilt")

    conn.commit()
    conn.close()

    print("✅ DONE")

if __name__ == "__main__":
    main()