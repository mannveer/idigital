import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product, DEFAULT_PRODUCT_IMAGE } from '../models/product';
import { ImageService } from './image.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [];

  constructor(private imageService: ImageService) {
    this.initializeMockProducts();
  }

  private initializeMockProducts() {
    try {
      console.log('Initializing mock products...');
      const productsData = [
        {
          id: '1',
          name: 'Digital Art Collection 2024',
          description: 'A stunning collection of digital artwork perfect for modern design projects. Includes over 100 unique pieces in various styles.',
          price: 29.99,
          fileType: 'ZIP',
          fileSize: '2.5GB',
          author: 'Digital Arts Studio',
          createdAt: new Date('2024-01-15'),
          featured: true,
          category: 'art'
        },
        {
          id: '2',
          name: 'Premium Icon Pack',
          description: 'Over 1000 customizable vector icons for your next project. Includes both filled and outlined styles.',
          price: 19.99,
          fileType: 'AI/SVG',
          fileSize: '500MB',
          author: 'Icon Masters',
          createdAt: new Date('2024-02-01'),
          featured: true,
          category: 'icons'
        },
        {
          id: '3',
          name: 'Modern UI Template Kit',
          description: 'Complete UI kit with modern design system and components. Perfect for web and mobile applications.',
          price: 49.99,
          fileType: 'Figma/Sketch',
          fileSize: '100MB',
          author: 'UI Design Pro',
          createdAt: new Date('2024-02-15'),
          featured: true,
          category: 'templates'
        },
        {
          id: '4',
          name: '3D Character Models Pack',
          description: 'Collection of high-quality 3D character models ready for animation. Includes rigged models and textures.',
          price: 79.99,
          fileType: 'FBX/OBJ',
          fileSize: '4GB',
          author: '3D Artists Collective',
          createdAt: new Date('2024-02-20'),
          featured: false,
          category: '3D Models'
        },
        {
          id: '5',
          name: 'Social Media Template Bundle',
          description: 'Professional social media templates for Instagram, Facebook, and Twitter. Includes story templates and post layouts.',
          price: 24.99,
          fileType: 'PSD/AI',
          fileSize: '1.2GB',
          author: 'Social Media Designs',
          createdAt: new Date('2024-02-25'),
          featured: false,
          category: 'templates'
        },
        {
          id: '6',
          name: 'Motion Graphics Pack',
          description: 'Professional motion graphics templates and animations. Perfect for video intros and social media.',
          price: 39.99,
          fileType: 'AE',
          fileSize: '3GB',
          author: 'Motion Design Studio',
          createdAt: new Date('2024-03-01'),
          featured: true,
          category: 'animations'
        },
        {
          id: '7',
          name: 'Photography Lightroom Presets',
          description: 'Professional Lightroom presets for stunning photo editing. Includes both color and black & white presets.',
          price: 34.99,
          fileType: 'XMP',
          fileSize: '50MB',
          author: 'Photo Masters',
          createdAt: new Date('2024-03-05'),
          featured: true,
          category: 'templates'
        },
        {
          id: '8',
          name: 'Vector Illustration Pack',
          description: 'Beautiful vector illustrations for modern designs. Perfect for websites and marketing materials.',
          price: 44.99,
          fileType: 'AI/EPS',
          fileSize: '1GB',
          author: 'Vector Studio Pro',
          createdAt: new Date('2024-03-10'),
          featured: true,
          category: 'art'
        }
      ];

      this.products = productsData.map(product => {
        try {
          const mappedProduct = {
            ...product,
            thumbnailUrl: this.imageService.getThumbnailUrl(product.name),
            sampleImages: [1, 2, 3].map(index => this.imageService.getSampleImage(index, product.name))
          };
          console.log(`Successfully mapped product: ${product.name}`);
          return mappedProduct;
        } catch (error) {
          console.error(`Error initializing product ${product.id}:`, error);
          return {
            ...product,
            thumbnailUrl: DEFAULT_PRODUCT_IMAGE,
            sampleImages: Array(3).fill(DEFAULT_PRODUCT_IMAGE)
          };
        }
      });

      console.log(`Initialized ${this.products.length} products`);
      console.log('Featured products:', this.products.filter(p => p.featured));
    } catch (error) {
      console.error('Error initializing mock products:', error);
      this.products = [];
    }
  }

  getProducts(): Observable<Product[]> {
    console.log('Getting all products:', this.products.length);
    return of(this.products);
  }

  getProduct(id: string): Observable<Product | undefined> {
    const product = this.products.find(p => p.id === id);
    console.log('Getting product by id:', id, product ? 'found' : 'not found');
    return of(product);
  }

  getDefaultProductImage(): string {
    return DEFAULT_PRODUCT_IMAGE;
  }

  searchProducts(query: string): Observable<Product[]> {
    const filteredProducts = this.products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );
    console.log(`Search for "${query}" returned ${filteredProducts.length} results`);
    return of(filteredProducts);
  }

  getFeaturedProducts(): Observable<Product[]> {
    const featured = this.products.filter(p => p.featured);
    console.log('Getting featured products:', featured.length);
    return of(featured);
  }
} 