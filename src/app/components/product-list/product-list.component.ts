import { Component, OnInit, OnDestroy, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';
import { register } from 'swiper/element/bundle';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subscription } from 'rxjs';

register();

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Discover Premium Digital Assets</h1>
          <p class="hero-subtitle">Find the perfect digital resources for your next creative project</p>
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Search digital assets..." 
              (input)="onSearch($event)"
              class="search-input"
            >
            <button class="search-button">
              <i class="material-icons">search</i>
            </button>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">1000+</span>
              <span class="stat-label">Digital Assets</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">50k+</span>
              <span class="stat-label">Happy Customers</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">4.8/5</span>
              <span class="stat-label">Average Rating</span>
            </div>
          </div>
        </div>
        <div class="hero-background"></div>
      </div>

      @if (featuredProducts.length > 0) {
        <div class="featured-section">
          <div class="featured-background"></div>
          <div class="container">
            <div class="section-header">
              <span class="section-badge">Featured</span>
              <h2 class="section-title">Trending Digital Assets</h2>
              <p class="section-subtitle">Discover our most popular and highly-rated digital products</p>
            </div>
            <swiper-container
              #swiper
              init="false"
              [navigation]="true"
              [pagination]="true"
              [slides-per-view]="'auto'"
              [space-between]="30"
              [centered-slides]="true"
              [grab-cursor]="true"
              class="featured-slider"
            >
              @for (product of featuredProducts; track product.id) {
                <swiper-slide>
                  <div class="featured-card">
                    <div class="featured-image" [routerLink]="['/products', product.id]">
                      <img [src]="product.thumbnailUrl" [alt]="product.name">
                      <div class="featured-overlay">
                        <span class="featured-price">{{ product.price | currency }}</span>
                        <span class="featured-category">{{ product.category }}</span>
                      </div>
                    </div>
                    <div class="featured-content">
                      <h3 [routerLink]="['/products', product.id]">{{ product.name }}</h3>
                      <p>{{ product.description }}</p>
                      <div class="featured-footer">
                        <div class="featured-author">
                          <i class="material-icons">person</i>
                          <span>{{ product.author }}</span>
                        </div>
                        <button 
                          class="featured-button" 
                          [class.added]="isProductInCart(product.id)"
                          [disabled]="isProductInCart(product.id)"
                          (click)="addToCart($event, product)"
                        >
                          <i class="material-icons">{{ isProductInCart(product.id) ? 'check' : 'add_shopping_cart' }}</i>
                          {{ isProductInCart(product.id) ? 'Added to Cart' : 'Add to Cart' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </swiper-slide>
              }
            </swiper-container>
          </div>
        </div>
      }

      <div class="categories-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Browse Categories</h2>
            <p class="section-subtitle">Find exactly what you need</p>
          </div>
          <div class="categories-grid">
            <a routerLink="/" class="category-card" [class.active]="currentCategory === 'all'" (click)="filterByCategory('all')">
              <div class="category-icon">
                <i class="material-icons">apps</i>
              </div>
              <h3>All</h3>
              <p>Browse everything</p>
            </a>
            <a routerLink="/" class="category-card" [class.active]="currentCategory === 'art'" (click)="filterByCategory('art')">
              <div class="category-icon">
                <i class="material-icons">palette</i>
              </div>
              <h3>Digital Art</h3>
              <p>Unique artwork & illustrations</p>
            </a>
            <a routerLink="/" class="category-card" [class.active]="currentCategory === 'icons'" (click)="filterByCategory('icons')">
              <div class="category-icon">
                <i class="material-icons">emoji_objects</i>
              </div>
              <h3>Icons</h3>
              <p>Professional icon sets</p>
            </a>
            <a routerLink="/" class="category-card" [class.active]="currentCategory === 'templates'" (click)="filterByCategory('templates')">
              <div class="category-icon">
                <i class="material-icons">description</i>
              </div>
              <h3>Templates</h3>
              <p>Ready-to-use templates</p>
            </a>
          </div>
        </div>
      </div>

      <div class="products-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">All Products</h2>
            <p class="section-subtitle">Explore our complete collection</p>
          </div>
          <div class="products-grid">
            @for (product of filteredProducts; track product.id) {
              <app-product-card [product]="product"></app-product-card>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .hero-section {
      position: relative;
      min-height: 600px;
      display: flex;
      align-items: center;
      padding: 4rem 0;
      overflow: hidden;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-hover) 100%);
    }

    .hero-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('/assets/hero-pattern.svg') center/cover;
      opacity: 0.1;
      z-index: 1;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
      color: white;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      line-height: 1.2;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .search-box {
      display: flex;
      max-width: 600px;
      margin: 0 auto 3rem;
      background: white;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .search-input {
      flex: 1;
      padding: 1rem 1.5rem;
      border: none;
      font-size: 1rem;
      outline: none;

      &::placeholder {
        color: var(--text-color-secondary);
      }
    }

    .search-button {
      padding: 1rem 1.5rem;
      background: var(--primary-color);
      border: none;
      color: white;
      cursor: pointer;
      transition: background-color 0.3s ease;

      &:hover {
        background: var(--primary-color-hover);
      }

      i {
        font-size: 1.5rem;
      }
    }

    .hero-stats {
      display: flex;
      justify-content: center;
      gap: 4rem;
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 1rem;
      opacity: 0.9;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-color);
      margin-bottom: 1rem;
    }

    .section-subtitle {
      font-size: 1.125rem;
      color: var(--text-color-secondary);
    }

    .featured-section {
      position: relative;
      padding: 8rem 0;
      background: linear-gradient(to bottom, var(--surface-color) 0%, white 100%);
      overflow: hidden;
    }

    .featured-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.05) 0%, rgba(var(--primary-rgb), 0.02) 100%);
      z-index: 1;
    }

    .section-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: rgba(var(--primary-rgb), 0.1);
      color: var(--primary-color);
      border-radius: 2rem;
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .featured-slider {
      margin: 0 -2rem;
      padding: 2rem;
      overflow: visible;

      swiper-slide {
        width: 400px;
        height: auto;
        transition: transform 0.3s ease;

        &:not(.swiper-slide-active) {
          transform: scale(0.9);
          opacity: 0.7;
        }
      }
    }

    .featured-card {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
      }
    }

    .featured-image {
      position: relative;
      width: 100%;
      height: 250px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      &:hover img {
        transform: scale(1.05);
      }
    }

    .featured-overlay {
      position: absolute;
      top: 1rem;
      left: 1rem;
      right: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 2;
    }

    .featured-price {
      background: var(--primary-color);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      font-weight: 600;
    }

    .featured-category {
      background: rgba(255, 255, 255, 0.9);
      color: var(--text-color);
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      font-size: 0.875rem;
      text-transform: capitalize;
    }

    .featured-content {
      padding: 2rem;

      h3 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--text-color);
      }

      p {
        color: var(--text-color-secondary);
        margin-bottom: 1.5rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .featured-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--surface-color);
    }

    .featured-author {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-color-secondary);
      font-size: 0.875rem;

      i {
        font-size: 1.25rem;
      }
    }

    .featured-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 2rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background: var(--primary-color-hover);
        transform: translateX(5px);
      }

      &.added {
        background: var(--success-color);
        cursor: default;
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      i {
        font-size: 1.25rem;
      }
    }

    swiper-container::part(button-prev),
    swiper-container::part(button-next) {
      width: 3rem;
      height: 3rem;
      background: white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      color: var(--primary-color);
      transition: all 0.3s ease;

      &:hover {
        background: var(--primary-color);
        color: white;
        transform: scale(1.1);
      }

      &::after {
        font-size: 1.25rem;
      }
    }

    swiper-container::part(pagination) {
      bottom: -2rem;
    }

    swiper-container::part(bullet) {
      width: 2rem;
      height: 0.25rem;
      border-radius: 0.125rem;
      background: var(--surface-color);
      transition: all 0.3s ease;
    }

    swiper-container::part(bullet-active) {
      background: var(--primary-color);
      transform: scaleX(1.5);
    }

    .categories-section {
      padding: 6rem 0;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .category-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      text-decoration: none;
      color: var(--text-color);
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      &.active {
        background: var(--primary-color);
        color: white;

        .category-icon {
          background: rgba(255, 255, 255, 0.2);
        }

        p {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }

    .category-icon {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-color);
      border-radius: 50%;
      margin-bottom: 1.5rem;

      i {
        font-size: 32px;
      }
    }

    .category-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .category-card p {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      text-align: center;
    }

    .products-section {
      padding: 6rem 0;
      background: var(--surface-color);
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }

    @media (max-width: 768px) {
      .container {
        padding: 0 1rem;
      }

      .hero-section {
        min-height: 500px;
        padding: 3rem 0;
      }

      .hero-title {
        font-size: 2.5rem;
      }

      .hero-subtitle {
        font-size: 1.125rem;
      }

      .hero-stats {
        gap: 2rem;
      }

      .stat-number {
        font-size: 1.5rem;
      }

      .section-title {
        font-size: 2rem;
      }

      .featured-slider swiper-slide {
        width: 300px;
      }

      .featured-image {
        height: 200px;
      }

      .featured-content {
        padding: 1.5rem;

        h3 {
          font-size: 1.25rem;
        }
      }
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class ProductListComponent implements OnInit, OnDestroy, AfterViewInit {
  products: Product[] = [];
  featuredProducts: Product[] = [];
  filteredProducts: Product[] = [];
  currentCategory: string = 'all';
  private cartSubscription?: Subscription;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    console.log('ProductListComponent initializing...');
    this.loadProducts();
    this.cartSubscription = this.cartService.cartItems$.subscribe(() => {
      // Cart state has changed, component will re-render
    });
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    // Initialize Swiper
    const swiperEl: any = document.querySelector('swiper-container');
    if (swiperEl) {
      Object.assign(swiperEl, {
        slidesPerView: 'auto',
        spaceBetween: 20,
        centeredSlides: true,
        grabCursor: true,
        pagination: {
          clickable: true
        },
        navigation: true
      });
      swiperEl.initialize();
    }
  }

  private loadProducts() {
    console.log('Loading products...');
    this.productService.getProducts().subscribe(products => {
      console.log('Products loaded:', products.length);
      this.products = products;
      this.filteredProducts = products;
      this.featuredProducts = products.filter(p => p.featured);
      console.log('Featured products loaded:', this.featuredProducts.length);
    });
  }

  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filterProducts(searchTerm);
  }

  filterByCategory(category: string) {
    this.currentCategory = category;
    if (category === 'all') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    }
  }

  private filterProducts(searchTerm: string) {
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );
  }

  isProductInCart(productId: string): boolean {
    return this.cartService.isProductInCart(productId);
  }

  addToCart(event: Event, product: Product): void {
    event.stopPropagation(); // Prevent navigation when clicking the button
    if (!this.isProductInCart(product.id)) {
      this.cartService.addToCart(product);
    }
  }
} 