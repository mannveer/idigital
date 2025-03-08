import { Component, OnInit, OnDestroy, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product';
import { register } from 'swiper/element/bundle';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subscription, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormsModule } from '@angular/forms';

register();

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Discover Premium Digital Assets</h1>
          <p class="hero-subtitle">Find the perfect digital resources for your next creative project</p>
          <div class="search-container">
            <div class="search-box">
              <input 
                type="text" 
                placeholder="Search digital assets..." 
                (input)="onSearch($event)"
                [(ngModel)]="searchQuery"
                class="search-input"
              >
              <button class="search-button">
                @if (isSearching) {
                  <div class="spinner"></div>
                } @else {
                  <i class="material-icons">search</i>
                }
              </button>
            </div>
            @if (showSearchResults && searchResults.length > 0) {
              <div class="search-results">
                @for (product of searchResults; track product.id) {
                  <div 
                    class="search-result-item" 
                    [routerLink]="['/product', product.id]"
                    (click)="closeSearchResults()"
                  >
                    <img [src]="product.thumbnailUrl" [alt]="product.name" class="result-image">
                    <div class="result-info">
                      <h4>{{ product.name }}</h4>
                      <p>{{ product.category }}</p>
                      <span class="result-price">{{ product.price | currency }}</span>
                    </div>
                  </div>
                }
              </div>
            } @else if (showSearchResults && searchQuery && !isSearching) {
              <div class="search-results">
                <div class="no-results">
                  <i class="material-icons">search_off</i>
                  <p>No results found for "{{ searchQuery }}"</p>
                </div>
              </div>
            }
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

    .search-container {
      position: relative;
      max-width: 600px;
      margin: 0 auto 3rem;
    }

    .search-box {
      display: flex;
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      position: relative;
      z-index: 1001;
    }

    .search-input {
      flex: 1;
      padding: 1rem 1.5rem;
      border: none;
      font-size: 1rem;
      outline: none;
      background: transparent;
      color: var(--text-color);

      &::placeholder {
        color: var(--text-color-secondary);
      }

      &.has-results {
        border-bottom-left-radius: 0;
      }
    }

    .search-button {
      padding: 1rem 1.5rem;
      background: var(--primary-color);
      border: none;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: var(--primary-color-hover);
      }

      i {
        font-size: 1.5rem;
        transition: transform 0.3s ease;
      }

      &:hover i {
        transform: scale(1.1);
      }
    }

    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      box-shadow: var(--shadow-md);
      margin-top: 0.5rem;
      max-height: 400px;
      overflow-y: auto;
      z-index: 1000;
    }

    .search-result-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: var(--hover-color);
      }

      &:not(:last-child) {
        border-bottom: 1px solid var(--border-color);
      }
    }

    .result-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 0.5rem;
    }

    .result-info {
      flex: 1;

      h4 {
        margin: 0 0 0.25rem;
        font-size: 1rem;
        color: var(--text-color);
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--text-color-secondary);
      }
    }

    .result-price {
      font-weight: 600;
      color: var(--primary-color);
    }

    .no-results {
      padding: 2rem;
      text-align: center;
      color: var(--text-color-secondary);

      i {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }

      p {
        margin: 0;
      }
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
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
      background: var(--surface-color);
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
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-md);
        border-color: var(--primary-color);
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
      background: var(--surface-color);
      color: var(--text-color);
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      font-size: 0.875rem;
      text-transform: capitalize;
      border: 1px solid var(--border-color);
    }

    .featured-content {
      padding: 2rem;

      h3 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--text-color);
        transition: color 0.3s ease;

        &:hover {
          color: var(--primary-color);
        }
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
      border-top: 1px solid var(--border-color);
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
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: 50%;
      box-shadow: var(--shadow-sm);
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
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      box-shadow: var(--shadow-sm);
      text-decoration: none;
      color: var(--text-color);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-md);
        border-color: var(--primary-color);
      }

      &.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);

        .category-icon {
          background: rgba(255, 255, 255, 0.2);
          color: white;
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
      background: var(--hover-color);
      color: var(--primary-color);
      border-radius: 50%;
      margin-bottom: 1.5rem;
      transition: all 0.3s ease;

      i {
        font-size: 32px;
      }
    }

    .category-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--text-color);
    }

    .category-card p {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      text-align: center;
    }

    .products-section {
      padding: 6rem 0;
      background: var(--background-color);
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
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  isSearching: boolean = false;
  showSearchResults: boolean = false;
  searchResults: Product[] = [];
  searchQuery: string = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {
    // Initialize search subscription with debounce
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300), // Wait 300ms after the last event
      distinctUntilChanged() // Only emit if the value has changed
    ).subscribe(searchTerm => {
      this.filterProducts(searchTerm);
    });
  }

  ngOnInit() {
    console.log('ProductListComponent initializing...');
    this.loadProducts();
    this.cartSubscription = this.cartService.cartItems$.subscribe(() => {
      // Cart state has changed, component will re-render
    });

    // Close search results when clicking outside
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  private handleClickOutside(event: MouseEvent) {
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer && !searchContainer.contains(event.target as Node)) {
      this.showSearchResults = false;
    }
  }

  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchQuery = searchTerm;
    this.showSearchResults = searchTerm.length > 0;
    this.searchSubject.next(searchTerm);
  }

  private filterProducts(searchTerm: string) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      this.filteredProducts = this.currentCategory === 'all' 
        ? this.products 
        : this.products.filter(p => p.category.toLowerCase() === this.currentCategory.toLowerCase());
      this.searchResults = [];
      this.isSearching = false;
      return;
    }

    this.isSearching = true;
    this.productService.searchProducts(searchTerm).subscribe(results => {
      this.searchResults = results.slice(0, 5); // Show top 5 results in dropdown
      this.filteredProducts = this.currentCategory === 'all'
        ? results
        : results.filter(p => p.category.toLowerCase() === this.currentCategory.toLowerCase());
      this.isSearching = false;
    });
  }

  selectSearchResult(product: Product) {
    // Navigate to product details
    // You'll need to implement this method
  }

  closeSearchResults() {
    this.showSearchResults = false;
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