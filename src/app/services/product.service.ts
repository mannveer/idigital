import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.model';
import { ImageService } from './image.service';

interface SearchResult {
  product: Product;
  relevance: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [];

  constructor(private imageService: ImageService) {
    this.initializeMockProducts();
  }

  private initializeMockProducts(): void {
    const categories = ['art', 'icons', 'templates', '3D Models', 'animations'];
    const products: Product[] = [
      {
        id: '1',
        name: 'Digital Art Collection',
        description: 'A stunning collection of digital artwork perfect for modern designs.',
        price: 29.99,
        fileType: 'ZIP',
        fileSize: '250MB',
        author: 'Creative Studio',
        createdAt: new Date('2024-01-15'),
        featured: true,
        category: 'art',
        thumbnailUrl: this.imageService.getThumbnailUrl('Digital Art Collection', 'art'),
        sampleImages: Array.from({ length: 4 }, (_, i) => 
          this.imageService.getSampleImage(i, 'Digital Art Collection', 'art')
        )
      },
      {
        id: '2',
        name: 'Icon Pack Pro',
        description: 'Professional icon pack with over 1000 customizable icons.',
        price: 19.99,
        fileType: 'AI/SVG',
        fileSize: '50MB',
        author: 'Icon Masters',
        createdAt: new Date('2024-02-01'),
        featured: true,
        category: 'icons',
        thumbnailUrl: this.imageService.getThumbnailUrl('Icon Pack Pro', 'icons'),
        sampleImages: Array.from({ length: 4 }, (_, i) => 
          this.imageService.getSampleImage(i, 'Icon Pack Pro', 'icons')
        )
      },
      {
        id: '3',
        name: 'Website Template Bundle',
        description: 'Modern and responsive website templates for various industries.',
        price: 39.99,
        fileType: 'HTML/CSS',
        fileSize: '150MB',
        author: 'Web Experts',
        createdAt: new Date('2024-02-15'),
        featured: true,
        category: 'templates',
        thumbnailUrl: this.imageService.getThumbnailUrl('Website Template Bundle', 'templates'),
        sampleImages: Array.from({ length: 4 }, (_, i) => 
          this.imageService.getSampleImage(i, 'Website Template Bundle', 'templates')
        )
      },
      {
        id: '4',
        name: '3D Character Models',
        description: 'High-quality 3D character models for games and animations.',
        price: 49.99,
        fileType: 'FBX/OBJ',
        fileSize: '500MB',
        author: '3D Creators',
        createdAt: new Date('2024-03-01'),
        featured: false,
        category: '3D Models',
        thumbnailUrl: this.imageService.getThumbnailUrl('3D Character Models', '3D Models'),
        sampleImages: Array.from({ length: 4 }, (_, i) => 
          this.imageService.getSampleImage(i, '3D Character Models', '3D Models')
        )
      },
      {
        id: '5',
        name: 'Motion Graphics Pack',
        description: 'Professional motion graphics templates and animations.',
        price: 34.99,
        fileType: 'AE',
        fileSize: '750MB',
        author: 'Animation Studio',
        createdAt: new Date('2024-03-15'),
        featured: false,
        category: 'animations',
        thumbnailUrl: this.imageService.getThumbnailUrl('Motion Graphics Pack', 'animations'),
        sampleImages: Array.from({ length: 4 }, (_, i) => 
          this.imageService.getSampleImage(i, 'Motion Graphics Pack', 'animations')
        )
      }
    ];

    this.products = products;
  }

  getProducts(): Observable<Product[]> {
    return of(this.products);
  }

  getProduct(id: string): Observable<Product | undefined> {
    return of(this.products.find(p => p.id === id));
  }

  searchProducts(query: string): Observable<Product[]> {
    const normalizedQuery = query.toLowerCase();
    return of(this.products.filter(p => 
      p.name.toLowerCase().includes(normalizedQuery) || 
      p.description.toLowerCase().includes(normalizedQuery) ||
      p.category.toLowerCase().includes(normalizedQuery)
    ));
  }

  getFeaturedProducts(): Observable<Product[]> {
    return of(this.products.filter(p => p.featured));
  }
} 