import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middleware/auth.middleware';

function extractBudgetCode(param: any): string {
  return Array.isArray(param) ? param[0] : param;
}

// =========================
// MEMBERS
// =========================
async function getMembers(budget_code: string) {
  const result = await pool.query(`
    SELECT 
      first_name,
      last_name,
      age,
      net_salary
    FROM members
    WHERE budget_code::text = $1
    ORDER BY first_name, last_name
  `, [budget_code]);

  return result.rows.map(m => ({
    first_name: (m.first_name || '').replace(/\s+/g, ' ').trim(),
    last_name: (m.last_name || '').replace(/\s+/g, ' ').trim(),
    age: Number(m.age || 0),
    net_salary: Number(m.net_salary || 0)
  }));
}

// =========================
// NORMALIZE FAMILY
// =========================
function normalizeFamily(raw: any) {
  return {
    budget_code: raw.budget_code,
    family_name: raw.family_name,

    family_standard: parseFloat(raw.family_standard ?? '0'),
    income_for_standard: Number(raw.income_for_standard ?? 0),

    budget_distribution: Number(raw.budget_distribution || 0),
    personal_bonus: Number(raw.personal_bonus || 0),
    women_work_benefit: Number(raw.women_work_benefit || 0),
    travel: Number(raw.travel || 0),
    periodic_grant: Number(raw.periodic_grant || 0),
    special_help: Number(raw.special_help || 0),
    current_state: Number(raw.current_state || 0),

    pension: Number(raw.pension || 0),
    survivors: Number(raw.survivors || 0),
    old_age_allowance: Number(raw.old_age_allowance || 0),
    child_allowance: Number(raw.child_allowance || 0),

    community_tax: Number(raw.community_tax || 0),
    municipal_tax: Number(raw.municipal_tax || 0),
    arnona: Number(raw.arnona || 0),

    health_total: Number(raw.health_total || 0),
    health_0_50: Number(raw.health_0_50 || 0),
    health_50_70: Number(raw.health_50_70 || 0),
    health_70_plus: Number(raw.health_70_plus || 0),

    // 🔥 EXISTING — השתתפות בריאות
    health_participation: Number(raw.health_participation || 0),

    // 🔥 ADDED — הגבלת מס ערבות הדדית (AS)
    mutual_responsibility_cap: Number(raw.mutual_responsibility_cap || 0),

    toddlers: Number(raw.toddlers || 0),
    kindergarten: Number(raw.kindergarten || 0),
    elementary: Number(raw.elementary || 0),
    middle: Number(raw.middle || 0),
    high: Number(raw.high || 0),

    hishtalmut_fund: Number(raw.hishtalmut_fund ?? 0),
    pension_contribution: Number(raw.pension_contribution ?? 0)
  };
}

// =========================
// INPUTS
// =========================
function mapToInputs(family: any, members: any[]) {
  const salary_net = members.reduce(
    (sum, m) => sum + m.net_salary,
    0
  );

  return {
    salary_net,
    pension: family.pension,
    survivors: family.survivors,
    old_age_allowance: family.old_age_allowance,
    child_allowance: family.child_allowance,

    income_for_standard: family.income_for_standard,

    health_total: family.health_total,
    health_0_50: family.health_0_50,
    health_50_70: family.health_50_70,
    health_70_plus: family.health_70_plus,

    // 🔥 EXISTING
    health_participation: family.health_participation,

    // 🔥 ADDED — שיהיה זמין ל-Angular
    mutual_responsibility_cap: family.mutual_responsibility_cap,

    toddlers: family.toddlers,
    kindergarten: family.kindergarten,
    elementary: family.elementary,
    middle: family.middle,
    high: family.high
  };
}

// =========================
// RULES
// =========================
function normalizeRules(rows: any) {
  const r = rows?.[0] ?? {};

  return {
    nursery: Number(r.nursery ?? 0),
    kindergarten: Number(r.kindergarten ?? 0),
    primary: Number(r.primary ?? 0),
    middle: Number(r.middle ?? 0),
    highschool: Number(r.highschool ?? 0),

    health_total: Number(r.health_total ?? 0),
    health_0_50: Number(r.health_0_50 ?? 0),
    health_50_70: Number(r.health_50_70 ?? 0),
    health_70_plus: Number(r.health_70_plus ?? 0),

    K5: Number(r.k5 ?? 0),
    L5: Number(r.l5 ?? 0),

    K6: Number(r.k6 ?? 0),
    J6: Number(r.j6 ?? 0),
    L6: Number(r.l6 ?? 0),
    M5: Number(r.m5 ?? 0),

    K7: Number(r.k7 ?? 0),
    J7: Number(r.j7 ?? 0),
    L7: Number(r.l7 ?? 0),
    M6: Number(r.m6 ?? 0),

    F16: Number(r.f16 ?? 0),
    F21: Number(r.f21 ?? 0),
    F19: Number(r.f19 ?? 0),
  };
}

// =========================
// COMMON BUILDER
// =========================
async function buildResponse(budget_code: string) {
  const [familyRes, rulesRes] = await Promise.all([
    pool.query('SELECT * FROM families WHERE budget_code = $1', [budget_code]),
    pool.query('SELECT * FROM rules LIMIT 1')
  ]);

  if (!familyRes.rows.length) return null;

  const family = normalizeFamily(familyRes.rows[0]);
  const members = await getMembers(budget_code);

  return {
    family: {
      ...family,
      family_size: members.length
    },
    inputs: mapToInputs(family, members),
    members,
    rules: normalizeRules(rulesRes.rows)
  };
}

// =========================
// GET FAMILY
// =========================
export const getFamily = async (req: AuthRequest, res: Response) => {
  const budget_code = extractBudgetCode(req.params.budget_code);

  if (req.user?.role !== 'admin' && req.user?.budget_code !== budget_code) {
    return res.status(403).json({ error: 'אין הרשאה' });
  }

  try {
    const data = await buildResponse(budget_code);

    if (!data) {
      return res.status(404).json({ error: 'משפחה לא נמצאה' });
    }

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};

// =========================
// GET SIMULATION
// =========================
export const getSimulation = async (req: AuthRequest, res: Response) => {
  const budget_code = extractBudgetCode(req.params.budget_code);

  if (req.user?.role !== 'admin' && req.user?.budget_code !== budget_code) {
    return res.status(403).json({ error: 'אין הרשאה' });
  }

  try {
    const data = await buildResponse(budget_code);

    if (!data) {
      return res.status(404).json({ error: 'משפחה לא נמצאה' });
    }

    res.json({
      ...data,
      simulation: data.family
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};