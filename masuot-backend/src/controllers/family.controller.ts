import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middleware/auth.middleware';

function extractBudgetCode(param: any): string {

  return Array.isArray(param)
    ? param[0]
    : param;
}

// =========================
// MEMBERS
// =========================
async function getMembers(budget_code: string) {

  const result = await pool.query(`

    SELECT

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

    FROM members

    WHERE budget_code::text = $1

    ORDER BY first_name, last_name

  `, [budget_code]);

  return result.rows.map(m => ({

    member_code:
      m.member_code,

    first_name:
      (m.first_name || '')
        .replace(/\s+/g, ' ')
        .trim(),

    last_name:
      (m.last_name || '')
        .replace(/\s+/g, ' ')
        .trim(),

    age:
      Number(m.age || 0),

    net_salary:
      Number(m.net_salary || 0),

    gross_income:
      Number(m.gross_income || 0),

    credit_points:
      Number(m.credit_points || 0),

    income_type:
      (m.income_type || '')
        .trim(),

    status_code:
      Number(m.status_code || 0),

    education_group:
      (m.education_group || '')
        .replace(/\s+/g, ' ')
        .trim()
  }));
}

// =========================
// SPECIAL BUDGET
// =========================
async function getSpecialBudgets(
  budget_code: string
) {

  const result = await pool.query(`

    SELECT

      member_code,

      first_name,

      last_name,

      birth_date,

      age,

      bar_mitzvah_amount,

      bar_mitzvah_year,

      bat_mitzvah_amount,

      bat_mitzvah_year,

      wedding_grant,

      wedding_year,

      study_grant,

      study_year,

      paint_grant,

      paint_year,

      leaving_grant_25y,

      leaving_grant_25y_year,

      leaving_grant_age_65,

      leaving_grant_age_65_year,

      shares_amount

    FROM special_budgets

    WHERE budget_code::text = $1

  `, [budget_code]);

  return result.rows.map(r => ({

    member_code:
      r.member_code,

    first_name:
      (r.first_name || '')
        .trim(),

    last_name:
      (r.last_name || '')
        .trim(),

    birth_date:
      r.birth_date,

    age:
      Number(r.age || 0),

    bar_mitzvah_amount:
      Number(r.bar_mitzvah_amount || 0),

    bar_mitzvah_year:
      Number(r.bar_mitzvah_year || 0),

    bat_mitzvah_amount:
      Number(r.bat_mitzvah_amount || 0),

    bat_mitzvah_year:
      Number(r.bat_mitzvah_year || 0),

    wedding_grant:
      Number(r.wedding_grant || 0),

    wedding_year:
      Number(r.wedding_year || 0),

    study_grant:
      Number(r.study_grant || 0),

    study_year:
      Number(r.study_year || 0),

    paint_grant:
      Number(r.paint_grant || 0),

    paint_year:
      Number(r.paint_year || 0),

    leaving_grant_25y:
      Number(r.leaving_grant_25y || 0),

    leaving_grant_25y_year:
      Number(r.leaving_grant_25y_year || 0),

    leaving_grant_age_65:
      Number(r.leaving_grant_age_65 || 0),

    leaving_grant_age_65_year:
      Number(r.leaving_grant_age_65_year || 0),

    shares_amount:
      Number(r.shares_amount || 0)
  }));
}

// =========================
// NORMALIZE FAMILY
// =========================
function normalizeFamily(raw: any) {

  return {

    budget_code:
      raw.budget_code,

    family_name:
      raw.family_name,

    family_standard:
      parseFloat(raw.family_standard ?? '0'),

    income_for_standard:
      Number(raw.income_for_standard ?? 0),

    budget_distribution:
      Number(raw.budget_distribution || 0),

    personal_bonus:
      Number(raw.personal_bonus || 0),

    women_work_benefit:
      Number(raw.women_work_benefit || 0),

    travel:
      Number(raw.travel || 0),

    periodic_grant:
      Number(raw.periodic_grant || 0),

    special_help:
      Number(raw.special_help || 0),

    current_state:
      Number(raw.current_state || 0),

    pension:
      Number(raw.pension || 0),

    survivors:
      Number(raw.survivors || 0),

    old_age_allowance:
      Number(raw.old_age_allowance || 0),

    child_allowance:
      Number(raw.child_allowance || 0),

    additional_allowances:
      Number(raw.additional_allowances || 0),

    community_tax:
      Number(raw.community_tax || 0),

    municipal_tax:
      Number(raw.municipal_tax || 0),

    arnona:
      Number(raw.arnona || 0),

    health_total:
      Number(raw.health_total || 0),

    health_0_50:
      Number(raw.health_0_50 || 0),

    health_50_70:
      Number(raw.health_50_70 || 0),

    health_70_plus:
      Number(raw.health_70_plus || 0),

    health_participation:
      Number(raw.health_participation || 0),

    mutual_responsibility_cap:
      Number(raw.mutual_responsibility_cap || 0),

    toddlers:
      Number(raw.toddlers || 0),

    kindergarten:
      Number(raw.kindergarten || 0),

    elementary:
      Number(raw.elementary || 0),

    middle:
      Number(raw.middle || 0),

    high:
      Number(raw.high || 0),

    hishtalmut_fund:
      Number(raw.hishtalmut_fund ?? 0),

    pension_contribution:
      Number(raw.pension_contribution ?? 0)
  };
}

// =========================
// INPUTS
// =========================
function mapToInputs(
  family: any,
  members: any[]
) {

  const salary_net =
    members.reduce(
      (sum, m) => sum + m.net_salary,
      0
    );

  return {

    salary_net,

    pension:
      family.pension,

    survivors:
      family.survivors,

    old_age_allowance:
      family.old_age_allowance,

    child_allowance:
      family.child_allowance,

    income_for_standard:
      family.income_for_standard,

    health_total:
      family.health_total,

    health_0_50:
      family.health_0_50,

    health_50_70:
      family.health_50_70,

    health_70_plus:
      family.health_70_plus,

    health_participation:
      family.health_participation,

    mutual_responsibility_cap:
      family.mutual_responsibility_cap,

    toddlers:
      family.toddlers,

    kindergarten:
      family.kindergarten,

    elementary:
      family.elementary,

    middle:
      family.middle,

    high:
      family.high
  };
}

// =========================
// RULES
// =========================
function normalizeRules(rows: any[]) {

  const rules: Record<string, number> = {};

  for (const row of rows) {

    rules[row.key] =
      Number(row.value || 0);
  }

  return rules;
}

// =========================
// COMMON BUILDER
// =========================
async function buildResponse(
  budget_code: string
) {

  const [
    familyRes,
    rulesRes
  ] = await Promise.all([

    pool.query(`

      SELECT *

      FROM families

      WHERE budget_code = $1

    `, [budget_code]),

    pool.query(`

      SELECT
        key,
        value,
        category

      FROM rules

      ORDER BY category, key
    `)
  ]);

  if (!familyRes.rows.length) {

    return null;
  }

  const family =
    normalizeFamily(
      familyRes.rows[0]
    );

  const [
    members,
    specialBudgets
  ] = await Promise.all([

    getMembers(budget_code),

    getSpecialBudgets(budget_code)
  ]);

  return {

    family: {

      ...family,

      family_size:
        members.length
    },

    inputs:
      mapToInputs(
        family,
        members
      ),

    members,

    specialBudgets,

    rules:
      normalizeRules(
        rulesRes.rows
      )
  };
}

// =========================
// GET FAMILY
// =========================
export const getFamily = async (
  req: AuthRequest,
  res: Response
) => {

  const budget_code =
    extractBudgetCode(
      req.params.budget_code
    );

  if (

    req.user?.role !== 'admin'

    &&

    req.user?.budget_code !== budget_code

  ) {

    return res.status(403).json({

      error: 'אין הרשאה'
    });
  }

  try {

    const data =
      await buildResponse(
        budget_code
      );

    if (!data) {

      return res.status(404).json({

        error: 'משפחה לא נמצאה'
      });
    }

    res.json(data);

  } catch (err) {

    console.error(err);

    res.status(500).json({

      error: 'שגיאת שרת'
    });
  }
};

// =========================
// GET SIMULATION
// =========================
export const getSimulation = async (
  req: AuthRequest,
  res: Response
) => {

  const budget_code =
    extractBudgetCode(
      req.params.budget_code
    );

  if (

    req.user?.role !== 'admin'

    &&

    req.user?.budget_code !== budget_code

  ) {

    return res.status(403).json({

      error: 'אין הרשאה'
    });
  }

  try {

    const data =
      await buildResponse(
        budget_code
      );

    if (!data) {

      return res.status(404).json({

        error: 'משפחה לא נמצאה'
      });
    }

    res.json({

      ...data,

      simulation:
        data.family
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({

      error: 'שגיאת שרת'
    });
  }
};