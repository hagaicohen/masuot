import pool from '../db';

export const getSimulationData = async (budget_code: string) => {
  const [familyRes, salaryRes, constantsRes] = await Promise.all([
    pool.query('SELECT * FROM families WHERE budget_code = $1', [budget_code]),
    pool.query('SELECT * FROM salary_income WHERE budget_code = $1', [budget_code]),
    pool.query('SELECT * FROM constants WHERE id = 1'),
  ]);

  const family   = familyRes.rows[0];
  const salaries = salaryRes.rows;
  const constants = constantsRes.rows[0];

  if (!family) {
    throw new Error(`Family not found: ${budget_code}`);
  }

  return {
    family,
    salaries,
    constants
  };
};