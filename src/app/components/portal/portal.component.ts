import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, PurchasedFile } from '../../services/auth.service';

interface CountryCode {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-portal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="portal-container">
      <div class="auth-section" *ngIf="!isAuthenticated">
        <div class="auth-card">
          <div class="auth-header">
            <div class="logo-section">
              <i class="fas fa-shield-alt"></i>
              <h1>Welcome Back</h1>
              <p class="subtitle">Access your digital assets securely</p>
            </div>
          </div>

          @if (!showOtpInput) {
            <div class="auth-tabs">
              <button 
                [class.active]="loginType === 'email'"
                (click)="setLoginType('email')"
              >
                <i class="fas fa-envelope"></i>
                Email Login
              </button>
              <button 
                [class.active]="loginType === 'phone'"
                (click)="setLoginType('phone')"
              >
                <i class="fas fa-phone"></i>
                Phone Login
              </button>
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="sendOtp()" class="auth-form">
              @if (loginType === 'email') {
                <div class="form-group">
                  <label for="email">
                    <i class="fas fa-envelope"></i>
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    formControlName="email" 
                    placeholder="Enter your email"
                    [class.error]="isFieldInvalid('email')"
                  >
                  @if (isFieldInvalid('email')) {
                    <div class="error-message">
                      <i class="fas fa-exclamation-circle"></i>
                      <span>Please enter a valid email address</span>
                    </div>
                  }
                </div>
              } @else {
                <div class="form-group">
                  <label for="phone">
                    <i class="fas fa-phone"></i>
                    Mobile Number
                  </label>
                  <div class="phone-input-wrapper">
                    <div class="country-select" (click)="toggleCountryDropdown()">
                      <div class="selected-country">
                        <span class="country-flag">{{ selectedCountry.flag }}</span>
                        <span class="country-code">{{ selectedCountry.code }}</span>
                        <i class="fas fa-chevron-down"></i>
                      </div>
                    </div>
                    <input 
                      type="tel" 
                      id="phone" 
                      formControlName="phone" 
                      placeholder="Enter mobile number"
                      [class.error]="isFieldInvalid('phone')"
                    >
                  </div>
                  @if (showCountryDropdown) {
                    <div class="country-dropdown">
                      <div class="country-search">
                        <i class="fas fa-search"></i>
                        <input 
                          type="text" 
                          placeholder="Search countries..."
                          (input)="filterCountries($event)"
                          (click)="$event.stopPropagation()"
                          #searchInput
                        >
                      </div>
                      <div class="country-list">
                        @for (country of filteredCountries; track country.code) {
                          <div 
                            class="country-option" 
                            [class.selected]="selectedCountry.code === country.code"
                            (click)="selectCountry(country); $event.stopPropagation()"
                          >
                            <span class="country-flag">{{ country.flag }}</span>
                            <span class="country-name">{{ country.name }}</span>
                            <span class="country-code">{{ country.code }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  }
                  @if (isFieldInvalid('phone')) {
                    <div class="error-message">
                      <i class="fas fa-exclamation-circle"></i>
                      <span>Please enter a valid mobile number</span>
                    </div>
                  }
                </div>
              }

              <button 
                type="submit" 
                class="submit-button"
                [disabled]="!loginForm.valid || isProcessing"
              >
                @if (isProcessing) {
                  <div class="spinner"></div>
                  <span>Sending OTP...</span>
                } @else {
                  <i class="fas fa-paper-plane"></i>
                  <span>Send Verification Code</span>
                }
              </button>
            </form>
          } @else {
            <div class="otp-section">
              <div class="back-button" (click)="showOtpInput = false">
                <i class="fas fa-arrow-left"></i>
              </div>
              <div class="otp-header">
                <i class="fas fa-key"></i>
                <h2>Enter Verification Code</h2>
                <p>We've sent a code to {{ loginType === 'email' ? (loginForm.get('email')?.value) : (selectedCountry.code + loginForm.get('phone')?.value) }}</p>
              </div>
              
              <form [formGroup]="otpForm" (ngSubmit)="verifyOtp()">
                <div class="otp-input-container">
                  @for (i of [0,1,2,3,4,5]; track i) {
                    <input 
                      type="text" 
                      class="otp-input"
                      maxlength="1"
                      [formControlName]="'digit' + i"
                      (input)="onOtpInput($event, i)"
                      (keydown)="onOtpKeyDown($event, i)"
                      #otpInput
                    >
                  }
                </div>
                @if (otpError) {
                  <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>{{ otpError }}</span>
                  </div>
                }
                <div class="otp-timer" *ngIf="otpTimer > 0">
                  <i class="fas fa-clock"></i>
                  Resend code in {{ otpTimer }}s
                </div>
                <button 
                  type="button" 
                  class="resend-button" 
                  (click)="resendOtp()"
                  [disabled]="otpTimer > 0"
                >
                  <i class="fas fa-redo"></i>
                  Resend Code
                </button>

                <button 
                  type="submit" 
                  class="submit-button"
                  [disabled]="!otpForm.valid || isProcessing"
                >
                  @if (isProcessing) {
                    <div class="spinner"></div>
                    <span>Verifying...</span>
                  } @else {
                    <i class="fas fa-lock-open"></i>
                    <span>Verify & Continue</span>
                  }
                </button>
              </form>
            </div>
          }
        </div>
      </div>

      <div class="portal-content" *ngIf="isAuthenticated">
        <div class="portal-header">
          <h1>My Downloads</h1>
          <button class="logout-button" (click)="logout()">
            <i class="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>

        <div class="downloads-grid">
          @if (purchasedFiles.length > 0) {
            @for (file of purchasedFiles; track file.id) {
              <div class="file-card">
                <div class="file-thumbnail">
                  <img [src]="file.thumbnailUrl" [alt]="file.name">
                  <div class="file-type">{{ file.fileType }}</div>
                </div>
                <div class="file-info">
                  <h3>{{ file.name }}</h3>
                  <p class="file-author">by {{ file.author }}</p>
                  <p class="file-description">{{ file.description }}</p>
                  <div class="file-meta">
                    <span class="meta-item">
                      <i class="fas fa-calendar"></i>
                      {{ file.purchaseDate | date:'mediumDate' }}
                    </span>
                    <span class="meta-item">
                      <i class="fas fa-file-archive"></i>
                      {{ file.fileSize }}
                    </span>
                    <span class="meta-item">
                      <i class="fas fa-certificate"></i>
                      {{ file.license }}
                    </span>
                  </div>
                </div>
                <div class="file-actions">
                  <button 
                    class="download-button" 
                    (click)="downloadFile(file)"
                    [class.loading]="isDownloading[file.id]"
                    [disabled]="isDownloading[file.id]"
                  >
                    @if (isDownloading[file.id]) {
                      <div class="spinner"></div>
                      <span>Downloading...</span>
                    } @else {
                      <i class="fas fa-download"></i>
                      <span>Download</span>
                    }
                  </button>
                </div>
              </div>
            }
          } @else {
            <div class="empty-state">
              <i class="fas fa-folder-open"></i>
              <h2>No Downloads Yet</h2>
              <p>Your purchased files will appear here</p>
              <button class="browse-button" routerLink="/">
                Browse Products
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    :host {
      display: block;
      min-height: 100vh;
      padding: 4rem 1rem 1rem;
      background: var(--surface-color);
      font-family: 'Inter', sans-serif;
      -webkit-tap-highlight-color: transparent;
    }

    .portal-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .auth-section {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 8rem);
    }

    .auth-card {
      width: 100%;
      max-width: 480px;
      background: var(--surface-color);
      border-radius: 24px;
      box-shadow: var(--shadow-lg);
      overflow: visible;
      border: 1px solid var(--border-color);
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
      }
    }

    .auth-header {
      padding: 3rem 2.5rem;
      text-align: center;
      background: var(--primary-color);
      color: white;
      position: relative;
      border-radius: 24px 24px 0 0;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
        pointer-events: none;
      }

      .logo-section {
        position: relative;
        z-index: 1;

        i {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: white;
          opacity: 0.9;
        }

        h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .subtitle {
          margin-top: 0.75rem;
          opacity: 0.9;
          font-size: 1rem;
        }
      }
    }

    .auth-tabs {
      display: flex;
      padding: 1.5rem 1.5rem 0;
      gap: 1rem;
      background: var(--surface-color);

      button {
        flex: 1;
        padding: 1rem;
        background: none;
        border: none;
        border-bottom: 2px solid var(--border-color);
        color: var(--text-light);
        font-weight: 500;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;

        i {
          font-size: 1.125rem;
        }

        &:hover:not(.active) {
          color: var(--text-color);
          border-color: var(--text-light);
        }

        &.active {
          color: var(--primary-color);
          border-color: var(--primary-color);
        }
      }
    }

    .auth-form {
      padding: 2rem 2.5rem 2.5rem;
      background: var(--surface-color);

      .form-group {
        margin-bottom: 1.5rem;
      }

      label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
        color: var(--text-color);
        font-weight: 500;
        font-size: 0.875rem;

        i {
          color: var(--primary-color);
          font-size: 1rem;
        }
      }
    }

    .phone-input-wrapper {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 1rem;
      align-items: start;
      position: relative;
    }

    input {
      width: 100%;
      padding: 1rem;
      border: 2px solid var(--border-color);
      border-radius: 12px;
      background: var(--surface-color);
      color: var(--text-color);
      font-size: 1rem;
      transition: all 0.3s ease;

      &::placeholder {
        color: var(--text-light);
        opacity: 0.7;
      }

      &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 4px rgba(var(--primary-color-rgb), 0.1);
      }

      &.error {
        border-color: var(--error-color);
        animation: shake 0.5s ease;
      }
    }

    .country-select {
      position: relative;
    }

    .selected-country {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      background: var(--surface-color);
      border: 2px solid var(--border-color);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      height: 48px;
      box-sizing: border-box;

      &:hover {
        border-color: var(--primary-color);
      }

      .country-flag {
        font-size: 1.5rem;
      }

      .country-code {
        font-weight: 500;
        color: var(--text-color);
      }

      i {
        margin-left: auto;
        color: var(--text-light);
        transition: transform 0.3s ease;
      }
    }

    .country-dropdown {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 360px;
      background: var(--surface-color);
      border-radius: 16px;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-color);
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    .country-search {
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid var(--border-color);
      position: relative;

      input {
        padding-left: 2.5rem;
        border-color: var(--border-color);
        
        &:focus {
          border-color: var(--primary-color);
        }
      }

      i {
        position: absolute;
        left: 2.5rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-light);
        pointer-events: none;
      }
    }

    .country-list {
      max-height: 300px;
      overflow-y: auto;
      padding: 1rem;

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-track {
        background: var(--surface-color);
      }

      &::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: 4px;

        &:hover {
          background: var(--text-light);
        }
      }
    }

    .country-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover {
        background: var(--hover-color);
      }

      &.selected {
        background: var(--primary-color);
        color: white;

        .country-code {
          color: rgba(255, 255, 255, 0.8);
        }
      }

      .country-flag {
        font-size: 1.5rem;
      }

      .country-name {
        flex: 1;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-color);
      }

      .country-code {
        font-size: 0.875rem;
        color: var(--text-light);
        font-weight: 500;
      }
    }

    .otp-section {
      padding: 2rem 2.5rem 2.5rem;
      background: var(--surface-color);
      position: relative;

      .back-button {
        position: absolute;
        top: 1.5rem;
        left: 1.5rem;
        padding: 0.5rem;
        cursor: pointer;
        color: var(--text-light);
        transition: all 0.3s ease;

        &:hover {
          color: var(--primary-color);
        }
      }
    }

    .otp-header {
      text-align: center;
      margin-bottom: 2rem;

      i {
        font-size: 2.5rem;
        color: var(--primary-color);
        margin-bottom: 1rem;
      }

      h2 {
        font-size: 1.5rem;
        margin: 0 0 0.5rem;
        color: var(--text-color);
      }

      p {
        color: var(--text-light);
        margin: 0;
        font-size: 0.875rem;
      }
    }

    .otp-input-container {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .otp-input {
      width: 100%;
      aspect-ratio: 1;
      text-align: center;
      font-size: 1.5rem;
      font-weight: 600;
      border: 2px solid var(--border-color);
      border-radius: 12px;
      background: var(--surface-color);
      color: var(--text-color);
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 4px rgba(var(--primary-color-rgb), 0.1);
      }
    }

    .otp-timer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: var(--text-light);
      font-size: 0.875rem;
      margin-bottom: 1rem;

      i {
        font-size: 1rem;
      }
    }

    .resend-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem;
      background: none;
      border: 2px solid var(--border-color);
      border-radius: 12px;
      color: var(--primary-color);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 1.5rem;

      i {
        font-size: 1rem;
      }

      &:disabled {
        color: var(--text-light);
        border-color: var(--border-color);
        cursor: not-allowed;
      }

      &:not(:disabled):hover {
        background: var(--hover-color);
        border-color: var(--primary-color);
      }
    }

    .submit-button {
      width: 100%;
      padding: 1rem;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.2);

      i {
        font-size: 1.125rem;
      }

      &:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(var(--primary-color-rgb), 0.3);
        background: var(--primary-color-dark);
      }

      &:not(:disabled):active {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--error-color);
      font-size: 0.875rem;
      margin-top: 0.5rem;

      i {
        font-size: 1rem;
      }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translate(-50%, -48%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }

    .portal-content {
      padding: 1rem;

      .portal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;

        h1 {
          font-size: clamp(1.5rem, 5vw, 2rem);
          margin: 0;
        }

        .logout-button {
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          border: none;
          background: var(--error-color);
          color: white;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;

          &:hover {
            background: var(--error-color-dark);
          }
        }
      }
    }

    .downloads-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .file-card {
      background: var(--surface-color);
      border-radius: 16px;
      border: 1px solid var(--border-color);
      overflow: hidden;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }

      .file-thumbnail {
        position: relative;
        aspect-ratio: 16/9;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .file-type {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.5rem 1rem;
          background: rgba(0, 0, 0, 0.75);
          color: white;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 500;
        }
      }

      .file-info {
        padding: 1.5rem;

        h3 {
          margin: 0 0 0.5rem;
          font-size: 1.125rem;
          color: var(--text-color);
        }

        .file-author {
          color: var(--text-light);
          font-size: 0.875rem;
          margin: 0 0 1rem;
        }

        .file-description {
          color: var(--text-color);
          font-size: 0.875rem;
          margin: 0 0 1.5rem;
          line-height: 1.5;
        }

        .file-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-light);
            font-size: 0.75rem;

            i {
              color: var(--primary-color);
            }
          }
        }
      }

      .file-actions {
        padding: 0 1.5rem 1.5rem;

        .download-button {
          width: 100%;
          padding: 0.875rem;
          border-radius: 12px;
          border: none;
          background: var(--primary-color);
          color: white;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;

          &:hover:not(:disabled) {
            background: var(--primary-color-dark);
          }

          &:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          &.loading {
            background: var(--primary-color-dark);
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 4rem 1rem;
      color: var(--text-light);

      i {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      h2 {
        font-size: 1.5rem;
        margin: 0 0 0.5rem;
        color: var(--text-color);
      }

      p {
        margin: 0 0 2rem;
      }

      .browse-button {
        padding: 0.875rem 2rem;
        border-radius: 12px;
        border: none;
        background: var(--primary-color);
        color: white;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: var(--primary-color-dark);
        }
      }
    }

    @media (max-width: 768px) {
      :host {
        padding: 4rem 0.5rem 0.5rem;
      }

      .auth-card {
        margin: 0 0.5rem;
        border-radius: 16px;
      }

      .auth-header {
        padding: 2rem 1.5rem;
        border-radius: 16px 16px 0 0;

        .logo-section {
          i {
            font-size: 2.5rem;
          }

          h1 {
            font-size: 1.5rem;
          }

          .subtitle {
            font-size: 0.875rem;
          }
        }
      }

      .auth-tabs {
        padding: 1rem 1rem 0;
      }

      .auth-form {
        padding: 1.5rem;
      }

      .phone-input-wrapper {
        grid-template-columns: 120px 1fr;
        gap: 0.5rem;
      }

      .country-dropdown {
        width: calc(100% - 2rem);
        max-height: 90vh;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      .otp-section {
        padding: 1.5rem;

        .back-button {
          top: 1rem;
          left: 1rem;
        }
      }

      .otp-header {
        i {
          font-size: 2rem;
        }

        h2 {
          font-size: 1.25rem;
        }
      }

      .otp-input-container {
        gap: 0.5rem;
      }

      .otp-input {
        font-size: 1.25rem;
      }

      .portal-content {
        padding: 0.5rem;
      }

      .downloads-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .file-card {
        margin: 0;
        border-radius: 12px;

        .file-info {
          padding: 1rem;
        }

        .file-actions {
          padding: 0 1rem 1rem;
        }
      }

      .empty-state {
        padding: 2rem 1rem;

        i {
          font-size: 2.5rem;
        }

        h2 {
          font-size: 1.25rem;
        }
      }
    }

    @media (max-width: 480px) {
      .auth-card {
        margin: 0;
      }

      .phone-input-wrapper {
        grid-template-columns: 100px 1fr;
      }

      .selected-country {
        padding: 0.75rem;
        gap: 0.5rem;

        .country-flag {
          font-size: 1.25rem;
        }
      }

      .country-option {
        padding: 0.625rem 0.75rem;
      }

      .submit-button {
        padding: 0.875rem;
        font-size: 0.875rem;
      }
    }

    @media (hover: none) {
      .auth-card {
        &:hover {
          transform: none;
          box-shadow: var(--shadow-lg);
        }
      }

      .file-card {
        &:hover {
          transform: none;
        }
      }

      .submit-button, .download-button {
        &:active {
          transform: scale(0.98);
        }
      }
    }
  `]
})
export class PortalComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  loginType: 'email' | 'phone' = 'email';
  showOtpInput = false;
  isProcessing = false;
  isAuthenticated = false;
  otpTimer = 0;
  otpError: string | null = null;
  showCountryDropdown = false;
  purchasedFiles: PurchasedFile[] = [];
  isDownloading: { [key: number]: boolean } = {};

  selectedCountry: CountryCode = {
    code: '+91',
    name: 'India',
    flag: '🇮🇳'
  };

  countries: CountryCode[] = [
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+1', name: 'United States', flag: '🇺🇸' },
    { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: '+86', name: 'China', flag: '🇨🇳' },
    { code: '+81', name: 'Japan', flag: '🇯🇵' },
    { code: '+49', name: 'Germany', flag: '🇩🇪' },
    { code: '+33', name: 'France', flag: '🇫🇷' },
    { code: '+39', name: 'Italy', flag: '🇮🇹' },
    { code: '+7', name: 'Russia', flag: '🇷🇺' },
    { code: '+82', name: 'South Korea', flag: '🇰🇷' },
    { code: '+55', name: 'Brazil', flag: '🇧🇷' },
    { code: '+52', name: 'Mexico', flag: '🇲🇽' },
    { code: '+34', name: 'Spain', flag: '🇪🇸' },
    { code: '+1', name: 'Canada', flag: '🇨🇦' }
  ];

  filteredCountries = this.countries;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    countryCode: ['+91'],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
  });

  otpForm = this.fb.group({
    digit0: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
    digit1: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
    digit2: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
    digit3: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
    digit4: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
    digit5: ['', [Validators.required, Validators.pattern('^[0-9]$')]]
  });

  constructor() {
    document.addEventListener('click', this.closeCountryDropdown.bind(this));
    this.authService.isAuthenticated$.subscribe(
      isAuth => this.isAuthenticated = isAuth
    );
    this.authService.purchasedFiles$.subscribe(
      files => this.purchasedFiles = files
    );
  }

  setLoginType(type: 'email' | 'phone'): void {
    this.loginType = type;
    this.loginForm.patchValue({
      email: '',
      phone: ''
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  toggleCountryDropdown(): void {
    this.showCountryDropdown = !this.showCountryDropdown;
  }

  selectCountry(country: CountryCode): void {
    this.selectedCountry = country;
    this.loginForm.patchValue({ countryCode: country.code });
    this.showCountryDropdown = false;
  }

  filterCountries(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredCountries = this.countries.filter(country =>
      country.name.toLowerCase().includes(searchTerm) ||
      country.code.includes(searchTerm)
    );
  }

  closeCountryDropdown(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.country-select')) {
      this.showCountryDropdown = false;
    }
  }

  sendOtp(): void {
    if (this.loginForm.invalid) return;
    this.isProcessing = true;

    const email = this.loginForm.get('email')?.value || '';
    const countryCode = this.loginForm.get('countryCode')?.value || '';
    const phone = this.loginForm.get('phone')?.value || '';
    
    const identifier = this.loginType === 'email' 
      ? email
      : countryCode + phone;

    if (!identifier) {
      this.isProcessing = false;
      return;
    }

    this.authService.sendOtp(identifier).subscribe({
      next: () => {
        this.isProcessing = false;
        this.showOtpInput = true;
        this.startOtpTimer();
      },
      error: () => {
        this.isProcessing = false;
        this.otpError = 'Failed to send OTP. Please try again.';
      }
    });
  }

  startOtpTimer(): void {
    this.otpTimer = 30;
    const timer = setInterval(() => {
      this.otpTimer--;
      if (this.otpTimer === 0) {
        clearInterval(timer);
      }
    }, 1000);
  }

  resendOtp(): void {
    if (this.otpTimer > 0) return;
    this.sendOtp();
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value.length === 1 && index < 5) {
      const nextInput = document.querySelector(`input[formControlName="digit${index + 1}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && index > 0 && !(event.target as HTMLInputElement).value) {
      const prevInput = document.querySelector(`input[formControlName="digit${index - 1}"]`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  }

  verifyOtp(): void {
    if (this.otpForm.invalid) return;
    this.isProcessing = true;

    const email = this.loginForm.get('email')?.value || '';
    const countryCode = this.loginForm.get('countryCode')?.value || '';
    const phone = this.loginForm.get('phone')?.value || '';
    
    const identifier = this.loginType === 'email'
      ? email
      : countryCode + phone;

    if (!identifier) {
      this.isProcessing = false;
      return;
    }

    const otp = Object.keys(this.otpForm.controls)
      .map(key => this.otpForm.get(key)?.value || '')
      .join('');

    this.authService.verifyOtp(identifier, otp).subscribe({
      next: () => {
        this.isProcessing = false;
        this.showOtpInput = false;
      },
      error: () => {
        this.isProcessing = false;
        this.otpError = 'Invalid OTP. Please try again.';
      }
    });
  }

  downloadFile(file: PurchasedFile): void {
    if (this.isDownloading[file.id]) return;
    
    this.isDownloading[file.id] = true;
    this.authService.downloadFile(file.id).subscribe({
      next: () => {
        window.open(file.downloadUrl, '_blank');
        this.isDownloading[file.id] = false;
      },
      error: () => {
        console.error('Failed to download file');
        this.isDownloading[file.id] = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.showOtpInput = false;
    this.loginForm.reset();
    this.otpForm.reset();
  }
} 