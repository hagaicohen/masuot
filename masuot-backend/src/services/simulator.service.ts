import pool from '../db';

export const getSimulationData = async (budget_code: string) => {
  const [familyRes, salaryRes] = await Promise.all([
    pool.query('SELECT * FROM families WHERE budget_code = $1', [budget_code]),
    pool.query('SELECT * FROM salary_income WHERE budget_code = $1', [budget_code]),
  ]);

  const family = familyRes.rows[0];
  const salaries = salaryRes.rows;

  if (!family) {
    throw new Error(`Family not found: ${budget_code}`);
  }

  // ===== NET SALARY =====
  const netSalary = salaries.reduce((sum, s) => {
    return sum + Number(s.amount || 0);
  }, 0);

  // ===== BASIC FIELDS (כדי לא לשבור UI) =====
  const budget_distribution = netSalary * 0.2;
  const personal_bonus = netSalary * 0.1;
  const women_work_benefit = Number(family.women_work_benefit || 0);
  const travel = Number(family.travel || 0);
  const periodic_grant = 0;
  const special_help = 0;

  const current_state =
    budget_distribution +
    personal_bonus +
    women_work_benefit +
    travel +
    periodic_grant +
    special_help;

  return {
    budget_distribution,
    personal_bonus,
    women_work_benefit,
    travel,
    periodic_grant,
    special_help,
    current_state
  };
};