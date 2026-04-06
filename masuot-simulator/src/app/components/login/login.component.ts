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
  code = ''; password = ''; error = ''; loading = false;
  constructor(private auth: AuthService) {}
  async onSubmit() {
  if (this.loading) return;

  this.error = '';
  this.loading = true;

  try {
    await this.auth.login(this.code, this.password);
  } catch (err: any) {
    this.error = err;
  } finally {
    this.loading = false;
  }
}
}
