import { Response } from 'express';
import pool from '../db';
import { getSimulationData } from '../services/simulator.service';
import { AuthRequest } from '../middleware/auth.middleware';

function extractBudgetCode(param: any): string {
  return Array.isArray(param) ? param[0] : param;
}

// =========================
// חישוב ילדים ובריאות
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

    // ילדים לפי האפיון
    if (age <= 3) children.nursery++;
    else if (age <= 6) children.kindergarten++;
    else if (age <= 12) children.primary++;
    else if (age <= 14) children.middle++;
    else if (age <= 18) children.highschool++;

    // בריאות
    if (age <= 50) health.age_0_50++;
    else if (age <= 70) health.age_50_70++;
    else health.age_70_plus++;
  }

  return { children, health };
}

// =========================
// mapping inputs
// =========================
function mapToInputs(family: any, members: any[]) {
  const { children, health } = buildChildrenAndHealth(members);

  return {
    salary_net: Number(family.net_salary_updated || 0),
    salary_net_updated: Number(family.net_salary_updated || 0),

    child_allowance: Number(family.child_allowance || 0),
    women_work_benefit: Number(family.women_work_benefit || 0),

    community_tax: Number(family.community_tax || 0),
    municipal_tax: Number(family.municipal_tax || 0),
    arnona: Number(family.arnona || 0),

    travel: Number(family.travel || 0),

    children,
    health
  };
}

// =========================
// ניקוי שמות
// =========================
function cleanMembers(rows: any[]) {
  return rows.map(m => ({
    first_name: m.first_name?.replace(/\s+/g, ' ').trim(),
    last_name: m.last_name?.replace(/\s+/g, ' ').trim(),
    age: Number(m.age)
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
    const [familyRes, membersRes, salaryRes] = await Promise.all([
      pool.query('SELECT * FROM families WHERE budget_code = $1', [budget_code]),
      pool.query('SELECT first_name, last_name, age FROM members WHERE budget_code = $1 ORDER BY age DESC', [budget_code]),
      pool.query('SELECT * FROM salary_income WHERE budget_code = $1', [budget_code]),
    ]);

    if (familyRes.rows.length === 0) {
      res.status(404).json({ error: 'משפחה לא נמצאה' });
      return;
    }

    const family = familyRes.rows[0];
    const members = cleanMembers(membersRes.rows);

    res.json({
      family: {
        budget_code: family.budget_code,
        family_name: family.family_name,
        family_size: Number(family.family_size || 0),
      },

      inputs: mapToInputs(family, members),

      members,

      salaries: salaryRes.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};

// =========================
// GET SIMULATION
// =========================
export const getSimulation = async (req: AuthRequest, res: Response): Promise<void> => {
  const budget_code = extractBudgetCode(req.params.budget_code);

  if (req.user?.role !== 'admin' && req.user?.budget_code !== budget_code) {
    res.status(403).json({ error: 'אין הרשאה' });
    return;
  }

  try {
    const expectedSalaries = req.body?.expected_salaries as
      { member_code: string; amount: number }[] | undefined;

    const [familyRes, membersRes, salaryRes, simulation] = await Promise.all([
      pool.query('SELECT * FROM families WHERE budget_code = $1', [budget_code]),
      pool.query('SELECT first_name, last_name, age FROM members WHERE budget_code = $1 ORDER BY age DESC', [budget_code]),
      pool.query('SELECT * FROM salary_income WHERE budget_code = $1', [budget_code]),
      getSimulationData(budget_code)
    ]);

    if (familyRes.rows.length === 0) {
      res.status(404).json({ error: 'משפחה לא נמצאה' });
      return;
    }

    const family = familyRes.rows[0];
    const members = cleanMembers(membersRes.rows);

    res.json({
      family: {
        budget_code: family.budget_code,
        family_name: family.family_name,
        family_size: Number(family.family_size || 0),
      },

      inputs: mapToInputs(family, members),

      members,

      salaries: salaryRes.rows,

      simulation
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'שגיאת שרת' });
  }
};