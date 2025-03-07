import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DEFAULT_PRODUCT_IMAGE } from '../../models/product';

@Component({
  selector: 'app-image-lazy-load',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-container" [class.loading]="isLoading">
      <img
        [src]="currentSrc"
        [alt]="alt"
        (load)="onImageLoad()"
        (error)="onImageError()"
        [class.loaded]="!isLoading"
      />
      <div class="loading-placeholder" *ngIf="isLoading">
        <div class="loading-spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .image-container {
      position: relative;
      width: 100%;
      height: 100%;
      background: var(--surface-color);
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .loading-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-color);
    }

    .loading-spinner {
      width: 24px;
      height: 24px;
      border: 2px solid var(--primary-color);
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 1s linear infinite;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    img.loaded {
      opacity: 1;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class ImageLazyLoadComponent implements OnInit {
  @Input() src: string = '';
  @Input() alt: string = '';
  
  isLoading: boolean = true;
  currentSrc: string = '';

  ngOnInit() {
    this.currentSrc = this.src || DEFAULT_PRODUCT_IMAGE;
  }

  onImageLoad() {
    this.isLoading = false;
  }

  onImageError() {
    if (this.currentSrc !== DEFAULT_PRODUCT_IMAGE) {
      this.currentSrc = DEFAULT_PRODUCT_IMAGE;
    }
  }
} 