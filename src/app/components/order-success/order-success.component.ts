import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="success-container">
      <div class="success-card">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase. Your digital assets are now ready for download.</p>
        
        <div class="info-box">
          <div class="info-row">
            <i class="fas fa-envelope"></i>
            <span>Order confirmation has been sent to your email</span>
          </div>
          <div class="info-row">
            <i class="fas fa-download"></i>
            <span>You can download your purchases from your account</span>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn-primary" (click)="goToDownloads()">
            <i class="fas fa-download"></i>
            Download Assets
          </button>
          <button class="btn-secondary" (click)="continueShopping()">
            <i class="fas fa-shopping-bag"></i>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
      box-sizing: border-box;
    }

    .success-container {
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .success-card {
      background: var(--color-background);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      box-shadow: var(--shadow-lg);
      width: 100%;
    }

    .success-icon {
      font-size: 4rem;
      color: var(--color-success);
      margin-bottom: 1.5rem;
      animation: scale-in 0.5s ease;
    }

    h1 {
      color: var(--color-text);
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    p {
      color: var(--color-text-light);
      margin-bottom: 2rem;
      font-size: 1.1rem;
      line-height: 1.5;
    }

    .info-box {
      background: var(--color-background-light);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      text-align: left;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: var(--color-text);
      margin-bottom: 1rem;

      &:last-child {
        margin-bottom: 0;
      }

      i {
        color: var(--color-primary);
        font-size: 1.25rem;
      }
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn-primary,
    .btn-secondary {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;

      i {
        font-size: 1.1rem;
      }
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;

      &:hover {
        background: var(--color-primary-dark);
        transform: translateY(-2px);
      }
    }

    .btn-secondary {
      background: var(--color-background-light);
      color: var(--color-text);
      border: 2px solid var(--color-border);

      &:hover {
        background: var(--color-background);
        transform: translateY(-2px);
      }
    }

    @keyframes scale-in {
      from {
        transform: scale(0);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      :host {
        padding: 1rem;
      }

      .action-buttons {
        flex-direction: column;
      }

      .btn-primary,
      .btn-secondary {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class OrderSuccessComponent {
  constructor(private router: Router) {}

  goToDownloads(): void {
    this.router.navigate(['/account/downloads']);
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }
} 