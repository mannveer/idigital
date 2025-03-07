import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { Subscription, switchMap, of } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

declare global {
  interface Window {
    Razorpay: any;
  }
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="checkout-container">
      <div class="checkout-header">
        <h1>Checkout</h1>
        <div class="steps">
          <div class="step active">
            <div class="step-number">1</div>
            <span>Order Summary</span>
          </div>
          <div class="step-line"></div>
          <div class="step" [class.active]="isPaymentStep">
            <div class="step-number">2</div>
            <span>Payment</span>
          </div>
        </div>
      </div>

      <div class="checkout-content">
        <div class="order-summary">
          <h2>Order Summary</h2>
          <div class="items-container">
            @if (isSingleProductCheckout && singleProduct) {
              <div class="item">
                <img [src]="singleProduct.thumbnailUrl" [alt]="singleProduct.name" />
                <div class="item-details">
                  <h3>{{ singleProduct.name }}</h3>
                  <p class="author">by {{ singleProduct.author }}</p>
                  <p class="license">Commercial License</p>
                </div>
                <div class="item-price">
                  \${{ formatPrice(singleProduct.price) }}
                </div>
              </div>
            } @else {
              @for (item of cartItems; track item.product.id) {
                <div class="item">
                  <img [src]="item.product.thumbnailUrl" [alt]="item.product.name" />
                  <div class="item-details">
                    <h3>{{ item.product.name }}</h3>
                    <p class="author">by {{ item.product.author }}</p>
                    <p class="license">Commercial License</p>
                  </div>
                  <div class="item-price">
                    \${{ formatPrice(item.product.price) }}
                  </div>
                </div>
              }
            }
          </div>

          <div class="summary-footer">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>\${{ formatPrice(subtotal) }}</span>
            </div>
            <div class="summary-row">
              <span>Tax (10%)</span>
              <span>\${{ formatPrice(tax) }}</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>\${{ formatPrice(total) }}</span>
            </div>
          </div>
        </div>

        <div class="payment-section">
          <h2>Payment Details</h2>
          <form [formGroup]="checkoutForm" class="payment-form">
            <div class="form-group">
              <label for="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                formControlName="email" 
                placeholder="Enter your email"
                [class.error]="isFieldInvalid('email')"
              >
              @if (isFieldInvalid('email')) {
                <span class="error-message">Please enter a valid email address</span>
              }
            </div>

            <div class="form-group">
              <label for="phone">Mobile Number</label>
              <div class="phone-input">
                <select id="countryCode" formControlName="countryCode">
                  <option value="+1">+1 (USA)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+91">+91 (India)</option>
                  <option value="+61">+61 (Australia)</option>
                  <option value="+86">+86 (China)</option>
                  <!-- Add more country codes as needed -->
                </select>
                <input 
                  type="tel" 
                  id="phone" 
                  formControlName="phone" 
                  placeholder="Enter mobile number"
                  [class.error]="isFieldInvalid('phone')"
                >
              </div>
              @if (isFieldInvalid('phone')) {
                <span class="error-message">Please enter a valid mobile number</span>
              }
            </div>

            <div class="payment-info">
              <div class="secure-badge">
                <i class="fas fa-lock"></i>
                <span>Secure Payment via Razorpay</span>
              </div>
              <div class="payment-methods">
                <img src="assets/images/payment/visa.png" alt="Visa" />
                <img src="assets/images/payment/mastercard.png" alt="Mastercard" />
                <img src="assets/images/payment/amex.png" alt="American Express" />
                <img src="assets/images/payment/upi.png" alt="UPI" />
              </div>
            </div>
            
            <button 
              class="pay-button" 
              [class.loading]="isProcessing"
              [disabled]="isProcessing || total === 0 || !checkoutForm.valid"
              (click)="processPayment()"
            >
              @if (isProcessing) {
                <div class="spinner"></div>
                <span>Processing...</span>
              } @else {
                <span>Pay \${{ formatPrice(total) }}</span>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      box-sizing: border-box;
    }

    .checkout-container {
      background: var(--color-background);
      border-radius: 16px;
      box-shadow: var(--shadow-lg);
      overflow: hidden;
    }

    .checkout-header {
      padding: 2rem;
      background: var(--color-background-light);
      border-bottom: 1px solid var(--color-border);
    }

    h1 {
      font-size: 2rem;
      color: var(--color-text);
      margin-bottom: 1.5rem;
    }

    .steps {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      opacity: 0.6;
    }

    .step.active {
      opacity: 1;
    }

    .step-number {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .step-line {
      flex: 1;
      height: 2px;
      background: var(--color-border);
      position: relative;
    }

    .step-line::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 0;
      background: var(--color-primary);
      transition: width 0.3s ease;
    }

    .step.active ~ .step-line::after {
      width: 100%;
    }

    .checkout-content {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 2rem;
      padding: 2rem;
    }

    .order-summary {
      background: var(--color-background-light);
      border-radius: 12px;
      padding: 1.5rem;
    }

    h2 {
      font-size: 1.5rem;
      color: var(--color-text);
      margin-bottom: 1.5rem;
    }

    .items-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .item {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1rem;
      padding: 1rem;
      background: var(--color-background);
      border-radius: 8px;
      align-items: center;
    }

    .item img {
      width: 80px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
    }

    .item-details h3 {
      font-size: 1rem;
      margin: 0 0 0.25rem;
    }

    .author {
      color: var(--color-text-light);
      font-size: 0.875rem;
      margin: 0 0 0.25rem;
    }

    .license {
      color: var(--color-success);
      font-size: 0.875rem;
      margin: 0;
    }

    .item-price {
      font-weight: 600;
      color: var(--color-primary);
    }

    .summary-footer {
      border-top: 1px solid var(--color-border);
      padding-top: 1rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      color: var(--color-text-light);
    }

    .summary-row.total {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-text);
      margin-top: 1rem;
    }

    .payment-section {
      background: var(--color-background-light);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .payment-info {
      margin-bottom: 2rem;
    }

    .secure-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--color-success);
      margin-bottom: 1rem;
    }

    .payment-methods {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .payment-methods img {
      height: 24px;
      object-fit: contain;
    }

    .pay-button {
      width: 100%;
      padding: 1.25rem;
      background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1.25rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
    }

    .pay-button:not(:disabled):hover {
      background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(99, 102, 241, 0.3);
    }

    .pay-button:not(:disabled):active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
    }

    .pay-button:disabled {
      background: linear-gradient(135deg, #A5B4FC 0%, #818CF8 100%);
      opacity: 0.7;
      cursor: not-allowed;
    }

    .pay-button .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .payment-form {
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--color-text);
      font-weight: 500;
    }

    input, select {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: var(--color-background);
      color: var(--color-text);
      font-size: 1rem;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
      }

      &.error {
        border-color: var(--color-error);
      }
    }

    .phone-input {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 0.5rem;
    }

    select {
      padding-right: 2rem;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%236B7280' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.5rem center;
    }

    .error-message {
      display: block;
      margin-top: 0.5rem;
      color: var(--color-error);
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      :host {
        padding: 1rem;
      }

      .checkout-content {
        grid-template-columns: 1fr;
      }

      .item {
        grid-template-columns: auto 1fr;
      }

      .item-price {
        grid-column: 2;
        justify-self: end;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartItems: { product: Product; quantity: number }[] = [];
  singleProduct: Product | null = null;
  isSingleProductCheckout = false;
  subtotal = 0;
  tax = 0;
  total = 0;
  isProcessing = false;
  isPaymentStep = false;
  private cartSubscription: Subscription | undefined;
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);

  checkoutForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    countryCode: ['+1', Validators.required],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
  });

  constructor() {
  }

  ngOnInit(): void {
    this.loadRazorpayScript();
    
    this.route.queryParams.pipe(
      switchMap(params => {
        const productId = params['productId'];
        if (productId) {
          this.isSingleProductCheckout = true;
          return this.productService.getProduct(productId);
        } else {
          this.isSingleProductCheckout = false;
          return of(null);
        }
      })
    ).subscribe(product => {
      if (product) {
        this.singleProduct = product;
        this.calculateTotals();
      } else {
        this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
          this.cartItems = items;
          this.calculateTotals();
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  private calculateTotals(): void {
    if (this.isSingleProductCheckout && this.singleProduct) {
      this.subtotal = this.singleProduct.price;
    } else {
      this.subtotal = this.cartItems.reduce((sum, item) => 
        sum + (item.product.price * item.quantity), 0);
    }
    this.tax = this.subtotal * 0.1; // 10% tax
    this.total = this.subtotal + this.tax;
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  private loadRazorpayScript(): void {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  processPayment(): void {
    if (this.isProcessing || !this.checkoutForm.valid) return;
    this.isProcessing = true;

    const email = this.checkoutForm.get('email')?.value || '';
    const countryCode = this.checkoutForm.get('countryCode')?.value || '';
    const phone = this.checkoutForm.get('phone')?.value || '';

    const options = {
      key: 'YOUR_RAZORPAY_KEY',
      amount: this.total * 100,
      currency: 'USD',
      name: 'Digital Marketplace',
      description: 'Purchase of Digital Assets',
      image: 'assets/images/logo.png',
      prefill: {
        email: email,
        contact: countryCode + phone
      },
      theme: {
        color: '#6366F1'
      },
      modal: {
        ondismiss: () => {
          this.isProcessing = false;
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  }
} 