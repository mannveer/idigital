import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section company-info">
          <h3>Digital Marketplace</h3>
          <p>Your premier destination for high-quality digital assets and creative resources.</p>
          <div class="social-links">
            <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn">
              <i class="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>

        <div class="footer-section quick-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a routerLink="/about">About Us</a></li>
            <li><a routerLink="/featured">Featured Assets</a></li>
            <li><a routerLink="/categories">Categories</a></li>
            <li><a routerLink="/sellers">Become a Seller</a></li>
          </ul>
        </div>

        <div class="footer-section legal-links">
          <h4>Legal</h4>
          <ul>
            <li><a routerLink="/privacy">Privacy Policy</a></li>
            <li><a routerLink="/terms">Terms & Conditions</a></li>
            <li><a routerLink="/refund">Refund & Cancellation</a></li>
            <li><a routerLink="/disclaimer">Disclaimer</a></li>
          </ul>
        </div>

        <div class="footer-section contact">
          <h4>Contact Us</h4>
          <ul>
            <li>
              <i class="material-icons">email</i>
              <a href="mailto:support@digitalmarketplace.com">support&#64;digitalmarketplace.com</a>
            </li>
            <li>
              <i class="material-icons">phone</i>
              <span>+1 (555) 123-4567</span>
            </li>
            <li>
              <i class="material-icons">location_on</i>
              <span>123 Digital Avenue, Suite 101<br>San Francisco, CA 94105</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <p>&copy; {{currentYear}} Digital Marketplace. All rights reserved.</p>
          <div class="payment-methods">
            <span>Secure Payments:</span>
            <i class="material-icons">credit_card</i>
            <i class="material-icons">payment</i>
            <i class="material-icons">account_balance</i>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--surface-color);
      color: var(--text-color);
      padding: 4rem 0 0;
      margin-top: 4rem;
      box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.02);
    }

    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 3rem;
    }

    .footer-section {
      h3 {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        background: var(--primary-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      h4 {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--text-color);
      }

      p {
        color: var(--text-color-secondary);
        line-height: 1.6;
        margin-bottom: 1.5rem;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          margin-bottom: 0.75rem;

          a {
            color: var(--text-color-secondary);
            text-decoration: none;
            transition: color 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;

            &:hover {
              color: var(--primary-color);
            }
          }
        }
      }
    }

    .social-links {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;

      a {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        background: var(--surface-color);
        color: var(--text-color-secondary);
        transition: all 0.3s ease;
        text-decoration: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        &[aria-label="Twitter"]:hover {
          background: #1DA1F2;
          color: white;
        }

        &[aria-label="Facebook"]:hover {
          background: #4267B2;
          color: white;
        }

        &[aria-label="Instagram"]:hover {
          background: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D);
          color: white;
        }

        &[aria-label="LinkedIn"]:hover {
          background: #0077B5;
          color: white;
        }

        i {
          font-size: 1.25rem;
        }
      }
    }

    .contact {
      ul li {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 1rem;
        color: var(--text-color-secondary);

        i {
          color: var(--primary-color);
          font-size: 1.25rem;
        }

        a {
          color: var(--text-color-secondary);
          text-decoration: none;
          transition: color 0.3s ease;

          &:hover {
            color: var(--primary-color);
          }
        }
      }
    }

    .footer-bottom {
      margin-top: 4rem;
      padding: 1.5rem 0;
      border-top: 1px solid var(--border-color);
    }

    .footer-bottom-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      p {
        color: var(--text-color-secondary);
        font-size: 0.875rem;
      }
    }

    .payment-methods {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-color-secondary);
      font-size: 0.875rem;

      i {
        font-size: 1.5rem;
        opacity: 0.8;
        transition: opacity 0.3s ease;

        &:hover {
          opacity: 1;
        }
      }
    }

    @media (max-width: 1200px) {
      .footer-content {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }
    }

    @media (max-width: 768px) {
      .footer {
        padding: 3rem 0 0;
      }

      .footer-content {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .footer-bottom-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
} 