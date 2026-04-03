import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db';

const JWT_SECRET = 'masuot-secret-key-2024';

export const login = async (req: Request, res: Response): Promise<void> => {
   const { budget_code, password } = req.body;


  if (!budget_code || !password) {
    res.status(400).json({ error: 'קוד תקציב וסיסמה נדרשים' });
    return;
  }

  try {
    const result = await pool.query(
      'SELECT u.*, f.family_name FROM users u JOIN families f ON u.budget_code = f.budget_code WHERE u.budget_code = $1',
      [budget_code]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'קוד תקציב או סיסמה שגויים' });
      return;
    }

    const user = result.rows[0];

    console.log('password received:', password);
    console.log('hash from DB:', user.password_hash);

    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log('isMatch:', isMatch);

    if (!isMatch) {
      res.status(401).json({ error: 'קוד תקציב או סיסמה שגויים' });
      return;
    }

    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE budget_code = $1',
      [budget_code]
    );

    const token = jwt.sign(
      { budget_code: user.budget_code, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      budget_code: user.budget_code,
      family_name: user.family_name,
      role:        user.role
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.json({ message: 'התנתקת בהצלחה' });
};