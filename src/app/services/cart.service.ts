import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItems.asObservable();

  constructor() {
    // Load cart from localStorage if exists
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart) && this.validateCartItems(parsedCart)) {
          this.cartItems.next(parsedCart);
        } else {
          console.warn('Invalid cart data found in localStorage, resetting cart');
          localStorage.removeItem('cart');
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }

  private validateCartItems(items: any[]): items is CartItem[] {
    return items.every(item => 
      item && 
      item.product && 
      typeof item.product.id === 'string' &&
      typeof item.quantity === 'number'
    );
  }

  addToCart(product: Product): void {
    if (!product || !product.id) {
      console.error('Invalid product:', product);
      return;
    }

    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(item => item.product.id === product.id);

    if (existingItem) {
      // If item exists, don't modify quantity as we want to allow only one instance
      return;
    } else {
      // Add new item with quantity 1
      const newItems = [...currentItems, { product, quantity: 1 }];
      this.cartItems.next(newItems);
      this.saveToLocalStorage(newItems);
    }
  }

  removeFromCart(productId: string): void {
    if (!productId) {
      console.error('Invalid productId:', productId);
      return;
    }

    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.filter(item => item.product.id !== productId);
    this.cartItems.next(updatedItems);
    this.saveToLocalStorage(updatedItems);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (!productId) {
      console.error('Invalid productId:', productId);
      return;
    }

    const currentItems = this.cartItems.value;
    const itemToUpdate = currentItems.find(item => item.product.id === productId);

    if (itemToUpdate) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        itemToUpdate.quantity = quantity;
        const updatedItems = [...currentItems];
        this.cartItems.next(updatedItems);
        this.saveToLocalStorage(updatedItems);
      }
    }
  }

  clearCart(): void {
    this.cartItems.next([]);
    localStorage.removeItem('cart');
  }

  getCartTotal(): number {
    return this.cartItems.value.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0);
  }

  isProductInCart(productId: string): boolean {
    if (!productId) {
      return false;
    }
    return this.cartItems.value.some(item => item.product && item.product.id === productId);
  }

  private saveToLocalStorage(items: CartItem[]): void {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }
} 