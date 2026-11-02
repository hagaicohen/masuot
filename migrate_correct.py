import argparse
import os
from collections import Counter
import psycopg2
from psycopg2.extras import execute_values
from openpyxl import load_workbook

EXCEL_PATH = "new.xlsx"
#EXCEL_PATH = r"c:\users\hagai\Downloads\פרק א - תקציבים והוצאות גרסה 27 להצגה.xlsx"

def connect():
    return psycopg2.connect(
        host="aws-1-ap-northeast-1.pooler.supabase.com",
        port=5432,
        database="postgres",
        user="postgres.jhkxyiiwtxtgqxovljkl",
        password="__Por@t2019!"
    )

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

def ensure_column_exists(cur):

    cur.execute("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='families'
        AND column_name='health_participation'
    """)

    if not cur.fetchone():

        print("Adding column health_participation...")

        cur.execute("""
            ALTER TABLE families
            ADD COLUMN health_participation NUMERIC DEFAULT 0
        """)

    cur.execute("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='families'
        AND column_name='mutual_responsibility_cap'
    """)

    if not cur.fetchone():

        print("Adding column mutual_responsibility_cap...")

        cur.execute("""
            ALTER TABLE families
            ADD COLUMN mutual_responsibility_cap NUMERIC DEFAULT 0
        """)

def deferred_values(cur, sql, rows):
    cur.operations.append(("values", sql, list(rows)))


def validate_unique(rows, label, indices):
    keys = [tuple(row[i] for i in indices) for row in rows]
    counts = Counter(keys)
    duplicates = [(key, count) for key, count in counts.items() if count > 1]
    if duplicates:
        for key, count in duplicates[:20]:
            print(f"DUPLICATE {label}: {key}, count={count}")
        raise ValueError(f"{label}: {len(duplicates)} duplicate keys; migration stopped")


def main():
    parser = argparse.ArgumentParser(description="Validate and migrate Masuot Excel")
    parser.add_argument("--excel", default=EXCEL_PATH)
    parser.add_argument("--apply", action="store_true", help="DANGEROUS: replace tables in Supabase")
    args = parser.parse_args()
    wb = load_workbook(args.excel, data_only=True)

    summary = wb["ריכוז נתונים"]

    members_sheet = wb["חברים"]

    salary_sheet = wb["הכנסות שכר "]

    discount_sheet = wb["הנחות "]

    class DeferredCursor:
        def __init__(self):
            self.operations = []
        def execute(self, query, params=None):
            self.operations.append(("execute", query, params))
        def fetchone(self):
            return None

    cur = DeferredCursor()
    print("Preparing migration without touching database...")

    # =====================================
    # DROP
    # =====================================

    cur.execute("DROP TABLE IF EXISTS members CASCADE")
    cur.execute("DROP TABLE IF EXISTS families CASCADE")
    cur.execute("DROP TABLE IF EXISTS rules CASCADE")

    print("Create tables...")

    # =====================================
    # FAMILIES
    # =====================================

    cur.execute("""
    CREATE TABLE families (

        budget_code TEXT PRIMARY KEY,

        family_name TEXT,

        family_standard NUMERIC,

        income_for_standard NUMERIC,

        budget_distribution NUMERIC,

        personal_bonus NUMERIC,

        women_work_benefit NUMERIC,

        travel NUMERIC,

        periodic_grant NUMERIC,

        special_help NUMERIC,

        current_state NUMERIC,

        pension NUMERIC,

        survivors NUMERIC,

        old_age_allowance NUMERIC,

        additional_allowances NUMERIC,

        child_allowance NUMERIC,

        community_tax NUMERIC,

        municipal_tax NUMERIC,

        arnona NUMERIC,

        health_total NUMERIC,

        health_0_50 NUMERIC,

        health_50_70 NUMERIC,

        health_70_plus NUMERIC,

        toddlers NUMERIC,

        kindergarten NUMERIC,

        elementary NUMERIC,

        middle NUMERIC,

        high NUMERIC,

        health_participation NUMERIC,

        mutual_responsibility_cap NUMERIC,

        hishtalmut_fund NUMERIC,

        pension_contribution NUMERIC
    )
    """)

    # =====================================
    # MEMBERS
    # =====================================

    cur.execute("""
    CREATE TABLE members (

        id SERIAL PRIMARY KEY,

        budget_code TEXT,

        member_code TEXT,

        first_name TEXT,

        last_name TEXT,

        age NUMERIC,

        net_salary NUMERIC,

        gross_income NUMERIC,

        credit_points NUMERIC,

        income_type TEXT,

        status_code NUMERIC,

        education_group TEXT
    )
    """)

    cur.execute("""
    ALTER TABLE members
    ADD CONSTRAINT uq_members_budget_member
    UNIQUE (budget_code, member_code)
    """)

    cur.execute("""
    CREATE INDEX idx_members_budget_code
    ON members(budget_code)
    """)

    cur.execute("""
    CREATE INDEX idx_members_member_code
    ON members(member_code)
    """)

    # =====================================
    # RULES
    # =====================================

    cur.execute("""
    CREATE TABLE rules (

        key TEXT PRIMARY KEY,

        value NUMERIC,

        category TEXT
    )
    """)

    # =====================================
    # IMPORT RULES
    # =====================================

    print("Importing rules...")

    rules_data = []

    # =====================================
    # EDUCATION
    # =====================================

    row = next(summary.iter_rows(min_row=1))

    rules_data.extend([

        ("nursery", to_num(row[7].value), "education"),

        ("kindergarten", to_num(row[8].value), "education"),

        ("primary", to_num(row[9].value), "education"),

        ("middle", to_num(row[10].value), "education"),

        ("highschool", to_num(row[11].value), "education")
    ])

    # =====================================
    # HEALTH
    # =====================================

    rules_data.extend([

        ("health_total", to_num(row[38].value), "health"),

        ("health_0_50", to_num(row[39].value), "health"),

        ("health_50_70", to_num(row[40].value), "health"),

        ("health_70_plus", to_num(row[41].value), "health")
    ])

    # =====================================
    # DISCOUNTS
    # =====================================

    rules_data.extend([

        ("K5", to_num(discount_sheet.cell(row=5, column=11).value), "discount"),

        ("L5", to_num(discount_sheet.cell(row=5, column=12).value), "discount"),

        ("K6", to_num(discount_sheet.cell(row=6, column=11).value), "discount"),

        ("J6", to_num(discount_sheet.cell(row=6, column=10).value), "discount"),

        ("L6", to_num(discount_sheet.cell(row=6, column=12).value), "discount"),

        ("M5", to_num(discount_sheet.cell(row=5, column=13).value), "discount"),

        ("K7", to_num(discount_sheet.cell(row=7, column=11).value), "discount"),

        ("J7", to_num(discount_sheet.cell(row=7, column=10).value), "discount"),

        ("L7", to_num(discount_sheet.cell(row=7, column=12).value), "discount"),

        ("M6", to_num(discount_sheet.cell(row=6, column=13).value), "discount"),

        ("F16", to_num(discount_sheet.cell(row=16, column=6).value), "discount"),

        ("F21", to_num(discount_sheet.cell(row=21, column=6).value), "discount"),

        ("F19", to_num(discount_sheet.cell(row=19, column=6).value), "discount"),

        ("F4", to_num(discount_sheet.cell(row=4, column=6).value), "discount")
    ])

    # =====================================
    # TAX BRACKETS (S:U)
    # =====================================

    for idx, row in enumerate(

        salary_sheet.iter_rows(
            min_row=2,
            max_row=7,
            min_col=19,
            max_col=21
        ),

        start=1
    ):

        threshold = to_num(row[0].value)

        tax_rate = to_num(row[1].value)

        diff = to_num(row[2].value)

        rules_data.extend([

            (
                f"mas_{idx}_limit",
                threshold,
                "tax"
            ),

            (
                f"mas_{idx}_rate",
                tax_rate,
                "tax"
            ),

            (
                f"mas_{idx}_diff",
                diff,
                "tax"
            )
        ])

    # =====================================
    # PAYROLL PARAMETERS (W:X)
    # =====================================

    for row in salary_sheet.iter_rows(
        min_row=2,
        max_row=7,
        min_col=23,
        max_col=24
    ):

        key = row[0].value

        value = to_num(row[1].value)

        if not is_valid(key):
            continue

        rules_data.append((
            str(key).strip(),
            value,
            "payroll"
        ))

    # =====================================
    # SAVINGS PARAMETERS (P:Q)
    # =====================================

    hishtalmut_rate = to_num(
        salary_sheet["P2"].value
    )

    hishtalmut_min_salary = to_num(
        salary_sheet["Q2"].value
    )

    pension_fund_rate = to_num(
        salary_sheet["P3"].value
    )

    pension_fund_offset = to_num(
        salary_sheet["Q3"].value
    )

    rules_data.extend([

        (
            "hishtalmut_rate",
            hishtalmut_rate,
            "savings"
        ),

        (
            "hishtalmut_min_salary",
            hishtalmut_min_salary,
            "savings"
        ),

        (
            "pension_fund_rate",
            pension_fund_rate,
            "savings"
        ),

        (
            "pension_fund_offset",
            pension_fund_offset,
            "savings"
        )
    ])

    # =====================================
    # INSERT RULES
    # =====================================

    print("Rules:", len(rules_data))

    deferred_values(cur, """
        INSERT INTO rules (

            key,

            value,

            category

        ) VALUES %s
    """, rules_data)

  

    # =====================================
    # SAVINGS MAP
    # =====================================

    savings_map = {}

    for row in salary_sheet.iter_rows(min_row=9):

        code = row[0].value

        if not is_valid(code):
            continue

        code = str(code).strip()

        hishtalmut = to_num(row[14].value)

        pension = to_num(row[15].value)

        if code not in savings_map:

            savings_map[code] = {
                "hishtalmut": 0,
                "pension": 0
            }

        savings_map[code]["hishtalmut"] += hishtalmut

        savings_map[code]["pension"] += pension

    # =====================================
    # FAMILIES
    # =====================================

    print("Importing families...")

    families_data = []

    for row in summary.iter_rows(min_row=5):

        code = row[0].value

        name = row[1].value

        if not is_valid(code):
            continue

        if name and "סיכום" in str(name):
            continue

        code = str(code).strip()

        health_participation = to_num(row[42].value)

        mutual_responsibility_cap = to_num(row[44].value)

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

            to_num(row[27].value),  # AB: additional_allowances

            to_num(row[28].value),  # AC: child_allowance

            to_num(row[46].value),  # AU: community_tax

            to_num(row[47].value),  # AV: municipal_tax

            to_num(row[48].value),  # AW: arnona

            to_num(row[38].value),

            to_num(row[39].value),

            to_num(row[40].value),

            to_num(row[41].value),

            to_num(row[7].value),

            to_num(row[8].value),

            to_num(row[9].value),

            to_num(row[10].value),

            to_num(row[11].value),

            health_participation,

            mutual_responsibility_cap,

            savings_map.get(code, {}).get("hishtalmut", 0),

            savings_map.get(code, {}).get("pension", 0)
        ))

    # Preflight: verify both allowance columns for budget 1261.
    target_allowances = next((r for r in summary.iter_rows(min_row=5)
                              if str(r[0].value).strip() == "1261"), None)
    if target_allowances is None:
        raise ValueError("Budget 1261 not found in Excel; migration stopped")
    excel_additional = to_num(target_allowances[27].value)  # AB
    excel_children = to_num(target_allowances[28].value)    # AC
    family_1261 = next((r for r in families_data if r[0] == "1261"), None)
    if family_1261 is None:
        raise ValueError("Budget 1261 not imported; migration stopped")
    # Column indices in INSERT tuple: additional_allowances=14, child_allowance=15.
    if (family_1261[14], family_1261[15]) != (excel_additional, excel_children):
        raise ValueError("Budget 1261 allowance mapping mismatch; migration stopped")
    print(f"1261 allowances: AB/additional={excel_additional}, AC/children={excel_children}")
    if excel_children != 383:
        raise ValueError(f"Budget 1261 expected AC/children=383, got {excel_children}; migration stopped")

    validate_unique(families_data, "families", (0,))
    deferred_values(cur, """
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

            additional_allowances,

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

            health_participation,

            mutual_responsibility_cap,

            hishtalmut_fund,

            pension_contribution

        ) VALUES %s
    """, families_data)

    print("Families:", len(families_data))

    # =====================================
    # MEMBERS
    # =====================================

    print("Importing members...")

    salary_map = {}

    for row in salary_sheet.iter_rows(min_row=9):

        code = row[0].value

        member_code = norm_id(row[2].value)

        if not is_valid(code) or not is_valid(member_code):
            continue

        code = str(code).strip()

        key = (code, member_code)

        gross_income = to_num(row[4].value)      # E

        income_type = row[8].value               # I

        credit_points = to_num(row[10].value)   # K

        net_income = to_num(row[12].value)      # M

        salary_map[key] = {

            "salary": salary_map.get(key, {}).get("salary", 0) + net_income,

            "gross_income": gross_income,

            "net_income": net_income,

            "credit_points": credit_points,

            "income_type": income_type
        }

    members_data = []

    for row in members_sheet.iter_rows(min_row=6):

        code = row[7].value

        member_code = norm_id(row[0].value)

        first_name = row[1].value

        last_name = row[2].value

        age = to_num(row[6].value)

        status_code = to_num(row[15].value)

        education_group = row[20].value

        if not is_valid(code) or not is_valid(member_code):
            continue

        code = str(code).strip()

        key = (code, member_code)

        salary_info = salary_map.get(key, {})

        net_salary = salary_info.get("net_income", 0)

        gross_income = salary_info.get("gross_income", 0)

        credit_points = salary_info.get("credit_points", 0)

        income_type = salary_info.get("income_type", "")

        members_data.append((

            code,

            member_code,

            first_name,

            last_name,

            age,

            net_salary,

            gross_income,

            credit_points,

            income_type,

            status_code,

            education_group
        ))

    validate_unique(members_data, "members", (0, 1))
    deferred_values(cur, """
        INSERT INTO members (

            budget_code,

            member_code,

            first_name,

            last_name,

            age,

            net_salary,

            gross_income,

            credit_points,

            income_type,

            status_code,

            education_group

        ) VALUES %s
    """, members_data)

    print("Members:", len(members_data))

    # Verify example family against cached Excel formula result (AQ).
    target = next((r for r in summary.iter_rows(min_row=5) if str(r[0].value).strip() == "1261"), None)
    if target:
        rates = [to_num(summary.cell(1, c).value) for c in (39, 40, 41, 42)]
        counts = [to_num(target[c - 1].value) for c in (39, 40, 41, 42)]
        calculated = sum(a * b for a, b in zip(rates, counts))
        expected = to_num(target[42].value)  # AQ
        print(f"1261 health: computed={calculated:.4f}, Excel AQ={expected:.4f}")
        if abs(calculated - expected) > 0.02:
            raise ValueError("1261 health mismatch; migration stopped")
    # Verify tax column mapping for budget 1261 before destructive apply.
    if target:
        actual_taxes = {
            "community_tax": to_num(target[46].value),  # AU
            "municipal_tax": to_num(target[47].value),  # AV
            "arnona": to_num(target[48].value),  # AW
        }
        print(f"1261 tax mapping: {actual_taxes}")
        expected_taxes = {"community_tax": 500.0, "municipal_tax": 1000.0, "arnona": 300.0}
        if actual_taxes != expected_taxes:
            raise ValueError(f"1261 tax mapping unexpected: {actual_taxes}; migration stopped")
    print("Preflight passed. Database has NOT been modified.")
    if not args.apply:
        print("To write: set SUPABASE_DB_PASSWORD and rerun with --apply (DESTRUCTIVE)")
        return

    conn = connect()
    try:
        with conn:
            with conn.cursor() as real_cur:
                for kind, sql, payload in cur.operations:
                    if kind == "execute":
                        real_cur.execute(sql, payload)
                    else:
                        execute_values(real_cur, sql, payload)
        print("Migration committed successfully")
    finally:
        conn.close()

if __name__ == "__main__":
    main()