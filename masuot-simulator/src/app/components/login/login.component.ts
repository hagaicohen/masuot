import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  code = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;

  constructor(private auth: AuthService) {}

  async onSubmit() {
    if (this.loading) return;

    // 🔥 ולידציה בסיסית
    if (!this.code || !this.password) {
      this.error = 'נא למלא קוד תקציב וסיסמה';
      return;
    }

    this.error = '';
    this.loading = true;

    try {
      await this.auth.login(this.code.trim(), this.password);

      // אם תרצה בעתיד:
      // ניווט אחרי התחברות
      // this.router.navigate(['/dashboard']);

    } catch (err: any) {

      // 🔥 טיפול חכם בשגיאות
      if (typeof err === 'string') {
        this.error = err;
      } else if (err?.error?.message) {
        this.error = err.error.message;
      } else if (err?.message) {
        this.error = err.message;
      } else {
        this.error = 'שגיאה בהתחברות. נסה שוב.';
      }

    } finally {
      this.loading = false;
    }
  }

  // 🔥 אופציונלי – נוחות
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}