import { Response } from 'express';
import pool from '../db';
import { AuthRequest } from '../middleware/auth.middleware';

function extractBudgetCode(param: any): string {
  return Array.isArray(param) ? param[0] : param;
}

// =========================
// GET RULES
// =========================
async function getRules() {
  const result = await pool.query(`SELECT key, value FROM rules`);

  return Object.fromEntries(
    result.rows.map(r => [r.key, Number(r.value)])
  );
}

// =========================
// ילדים ובריאות
// =========================
function buildChildrenAndHealth(members: any[]) {
  const children = {
    nursery: 0,
    kindergarten: 0,
    primary: 0,
    middle: 0,
    highschool: 0,
  };

  const health = {
    total: members.length,
    age_0_50: 0,
    age_50_70: 0,
    age_70_plus: 0,
  };

  for (const m of members) {
    const age = Number(m.age || 0);

    if (age <= 3) children.nursery++;
    else if (age <= 6) children.kindergarten++;
    else if (age <= 12) children.primary++;
    else if (age <= 14) children.middle++;
    else if (age <= 18) children.highschool++;

    if (age <= 50) health.age_0_50++;
    else if (age <= 70) health.age_50_70++;
    else health.age_70_plus++;
  }

  return { children, health };
}

// =========================
// inputs
// =========================
function mapToInputs(family: any, members: any[]) {
  const { children, health } = buildChildrenAndHealth(members);

  const salary_net = members.reduce(
    (sum, m: any) => sum + (m.salary?.net || 0),
    0
  );

  return {
    salary_net,

    pension: Number(family.pension || 0),
    survivors: Number(family.survivors || 0),
    old_age_allowance: Number(family.old_age_allowance || 0),
    child_allowance: Number(family.child_allowance || 0),

    flow_income: Number(family.flow_income || 0),
    health_cost: Number(family.health_cost || 0),

    children,
    health
  };
}

// =========================
// ניקוי
// =========================
function cleanMembers(rows: any[]) {
  return rows.map(m => ({
    first_name: m.first_name?.replace(/\s+/g, ' ').trim(),
    last_name: m.last_name?.replace(/\s+/g, ' ').trim(),
    age: Number(m.age)
  }));
}

// =========================
// MEMBERS + SALARY
// =========================
async function getMembersWithSalary(budget_code: string) {
  const result = await pool.query(`
    SELECT 
      m.first_name,
      m.last_name,
      m.age,
      SUM(s.amount) as net_amount,
      SUM(s.study_fund) as study_fund,
      SUM(s.pension_extra) as pension_extra
    FROM members m
    LEFT JOIN salary_income s
      ON m.budget_code = s.budget_code
      AND m.first_name = s.first_name
      AND m.last_name = s.last_name
    WHERE m.budget_code = $1
    GROUP BY m.first_name, m.last_name, m.age
    ORDER BY m.age DESC
  `, [budget_code]);

  const cleaned = cleanMembers(result.rows);

  return cleaned.map((m: any, i: number) => ({
    ...m,
    salary: {
      net: Number(result.rows[i].net_amount || 0),
      study_fund: Number(result.rows[i].study_fund || 0),
      pension_extra: Number(result.rows[i].pension_extra || 0),
    }
  }));
}

// =========================
// GET FAMILY
// =========================
export const getFamily = async (req: AuthRequest, res: Response): Promise<void> => {
  const budget_code = extractBudgetCode(req.params.budget_code);

  if (req.user?.role !== 'admin' && req.user?.budget_code !== budget_code) {
    res.status(403).json({ error: 'אין הרשאה' });
    return;
  }

  try {
    const [familyRes, rules] = await Promise.all([
      pool.query('SELECT * FROM families WHERE budget_code = $1', [budget_code]),
      getRules()
    ]);

    if (familyRes.rows.length === 0) {
      res.status(404).json({ error: 'משפחה לא נמצאה' });
      return;
    }

    const family = familyRes.rows[0];
    const members = await getMembersWithSalary(budget_code);

    res.json({
      family: family, // 🔥 מחזיר הכל כמו DB
      inputs: mapToInputs(family, members),
      members,
      rules
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};

// =========================
// GET SIMULATION (NO CALC)
// =========================
export const getSimulation = async (req: AuthRequest, res: Response): Promise<void> => {
  const budget_code = extractBudgetCode(req.params.budget_code);

  if (req.user?.role !== 'admin' && req.user?.budget_code !== budget_code) {
    res.status(403).json({ error: 'אין הרשאה' });
    return;
  }

  try {
    const [familyRes, rules] = await Promise.all([
      pool.query('SELECT * FROM families WHERE budget_code = $1', [budget_code]),
      getRules()
    ]);

    if (familyRes.rows.length === 0) {
      res.status(404).json({ error: 'משפחה לא נמצאה' });
      return;
    }

    const family = familyRes.rows[0];
    const members = await getMembersWithSalary(budget_code);

    res.json({
      family: family,
      inputs: mapToInputs(family, members),
      members,
      simulation: family, // 🔥 כל השדות מהאקסל
      rules
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'שגיאת שרת' });
  }
};