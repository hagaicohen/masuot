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

    # 🔥 בריאות
    add_column_if_not_exists(cur, "families", "health_total")
    add_column_if_not_exists(cur, "families", "health_0_50")
    add_column_if_not_exists(cur, "families", "health_50_70")
    add_column_if_not_exists(cur, "families", "health_70_plus")

    # 🔥 חינוך
    add_column_if_not_exists(cur, "families", "toddlers")
    add_column_if_not_exists(cur, "families", "kindergarten")
    add_column_if_not_exists(cur, "families", "elementary")
    add_column_if_not_exists(cur, "families", "middle")
    add_column_if_not_exists(cur, "families", "high")

    print("Cleaning tables...")
    cur.execute("TRUNCATE TABLE members RESTART IDENTITY CASCADE")
    cur.execute("TRUNCATE TABLE families CASCADE")
    cur.execute("TRUNCATE TABLE rules CASCADE")

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

            # 🔥 בריאות
            to_num(row[37].value),
            to_num(row[38].value),
            to_num(row[39].value),
            to_num(row[40].value),

            # 🔥 חינוך
            to_num(row[7].value),
            to_num(row[8].value),
            to_num(row[9].value),
            to_num(row[10].value),
            to_num(row[11].value)
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
            high
        ) VALUES %s
    """, families_data)

    print("Families:", len(families_data))

    # =========================
    # SALARIES
    # =========================
    salaries = {}

    for row in salary_sheet.iter_rows(min_row=2):
        b = row[0].value
        m = row[2].value

        if not is_valid_code(b):
            continue

        b = str(b).strip()
        m = str(m).strip() if m else ""

        salaries[(b, m)] = to_num(row[13].value)

    # =========================
    # MEMBERS
    # =========================
    members_data = []

    for row in members_sheet.iter_rows(min_row=2):
        member_code = row[0].value
        budget_code = row[7].value

        if not is_valid_code(budget_code):
            continue

        budget_code = str(budget_code).strip()
        member_code = str(member_code).strip()

        net = salaries.get((budget_code, member_code), 0)

        members_data.append((
            budget_code,
            member_code,
            (row[3].value or "").replace("  ", " ").strip(),
            (row[2].value or "").replace("  ", " ").strip(),
            to_num(row[6].value),
            net
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
    # RULES (🔥 כולל F16)
    # =========================
    rules = {
        "nursery":        to_num(summary.cell(1, 8).value),
        "kindergarten":   to_num(summary.cell(1, 9).value),
        "primary":        to_num(summary.cell(1, 10).value),
        "middle":         to_num(summary.cell(1, 11).value),
        "highschool":     to_num(summary.cell(1, 12).value),

        "health_total":   to_num(summary.cell(1, 38).value),
        "health_0_50":    to_num(summary.cell(1, 39).value),
        "health_50_70":   to_num(summary.cell(1, 40).value),
        "health_70_plus": to_num(summary.cell(1, 41).value),

        # 🔥 חדש – חינוך
        "education_participation_rate": to_num(discount_sheet.cell(16, 6).value),

        # 🔥 קיים
        "F21": to_num(discount_sheet.cell(21, 6).value)
    }

    execute_values(cur,
        "INSERT INTO rules (key, value) VALUES %s",
        [(k, to_num(v)) for k, v in rules.items()]
    )

    print("Rules:", len(rules))

    conn.commit()
    conn.close()

    print("✅ DONE FULL + HEALTH + EDUCATION + F16")

if __name__ == "__main__":
    main()