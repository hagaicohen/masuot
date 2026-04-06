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

def is_valid(v):
    return v is not None and str(v).strip() != ""

def norm_id(v):
    if v is None:
        return None
    try:
        return str(int(float(v))).strip()
    except:
        return str(v).strip()

def main():
    conn = connect()
    cur = conn.cursor()

    wb = load_workbook(EXCEL_PATH, data_only=True)

    summary = wb["ריכוז נתונים"]
    members_sheet = wb["חברים"]
    salary_sheet = wb["הכנסות שכר "]
    discount_sheet = wb["הנחות "]

    print("Cleaning tables...")
    cur.execute("TRUNCATE TABLE members RESTART IDENTITY CASCADE")
    cur.execute("TRUNCATE TABLE families CASCADE")
    cur.execute("TRUNCATE TABLE rules CASCADE")

    # 🔥 ADDED — savings map (O,P from salary sheet)
    savings_map = {}
    for row in salary_sheet.iter_rows(min_row=9):
        code = row[0].value  # A

        if not is_valid(code):
            continue

        code = str(code).strip()

        hishtalmut = to_num(row[14].value)  # O
        pension = to_num(row[15].value)     # P

        if code not in savings_map:
            savings_map[code] = {"hishtalmut": 0, "pension": 0}

        savings_map[code]["hishtalmut"] += hishtalmut
        savings_map[code]["pension"] += pension

    # =========================
    # FAMILIES (unchanged)
    # =========================
    families_data = []

    for row in summary.iter_rows(min_row=2):
        code = row[0].value
        name = row[1].value

        if not is_valid(code):
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

            # 🔥 ADDED — values from savings_map
            savings_map.get(code, {}).get("hishtalmut", 0),
            savings_map.get(code, {}).get("pension", 0)
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
    # MEMBERS (FINAL FIX)
    # =========================
    print("Importing members...")

    salary_map = {}

    for row in salary_sheet.iter_rows(min_row=9):
        code = row[0].value        # A
        member_code = norm_id(row[2].value)  # C

        if not is_valid(code) or not is_valid(member_code):
            continue

        code = str(code).strip()

        key = (code, member_code)

        salary = to_num(row[12].value)  # M

        salary_map[key] = salary_map.get(key, 0) + salary

    members_data = []

    for row in members_sheet.iter_rows(min_row=2):
        code = row[7].value              # H

        member_code = norm_id(row[0].value)   # A
        first_name = row[1].value
        last_name = row[2].value
        age = to_num(row[6].value)

        if not is_valid(code) or not is_valid(member_code):
            continue

        code = str(code).strip()

        key = (code, member_code)

        net_salary = salary_map.get(key, 0)

        members_data.append((
            code,
            member_code,
            first_name,
            last_name,
            age,
            net_salary
        ))

    execute_values(cur, """
        INSERT INTO members (
            budget_code,
            member_code,
            first_name,
            last_name,
            age,
            net_salary
        ) VALUES %s
    """, members_data)

    print("Members:", len(members_data))

    # =========================
    # RULES (unchanged)
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
        K5 NUMERIC, L5 NUMERIC,
        K6 NUMERIC, J6 NUMERIC, L6 NUMERIC, M5 NUMERIC,
        K7 NUMERIC, J7 NUMERIC, L7 NUMERIC, M6 NUMERIC,
        F16 NUMERIC, F21 NUMERIC
    )
    """)

    row = next(summary.iter_rows(min_row=2))

    cur.execute("""
    INSERT INTO rules VALUES (%s, %s, %s, %s, %s, %s,
                             %s, %s, %s, %s,
                             %s, %s, %s, %s, %s, %s,
                             %s, %s, %s, %s,
                             %s, %s)
    """, (
        "default",
        to_num(row[7].value),
        to_num(row[8].value),
        to_num(row[9].value),
        to_num(row[10].value),
        to_num(row[11].value),

        to_num(row[37].value),
        to_num(row[38].value),
        to_num(row[39].value),
        to_num(row[40].value),

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

        to_num(discount_sheet.cell(row=16, column=6).value),
        to_num(discount_sheet.cell(row=21, column=6).value)
    ))

    cur.execute("""
    CREATE INDEX IF NOT EXISTS idx_families_budget_code
    ON families(budget_code);
    """)

    cur.execute("""
    CREATE INDEX IF NOT EXISTS idx_members_budget_code
    ON members(budget_code);
    """)

    cur.execute("""
    CREATE INDEX IF NOT EXISTS idx_members_member_code
    ON members(member_code);
    """)

    print("Rules rebuilt")

    conn.commit()
    conn.close()

    print("✅ DONE")

if __name__ == "__main__":
    main()