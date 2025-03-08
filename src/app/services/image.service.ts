import { Injectable } from '@angular/core';
import { DEFAULT_PRODUCT_IMAGE } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly fallbackBaseUrl = 'https://placehold.co';
  private readonly categoryImages: Record<string, string[]> = {
    'art': ['art-1.jpg', 'art-2.jpg', 'art-3.jpg', 'art-4.jpg'],
    'icons': ['icons-1.jpg', 'icons-2.jpg', 'icons-3.jpg', 'icons-4.jpg'],
    'templates': ['template-1.jpg', 'template-2.jpg', 'template-3.jpg', 'template-4.jpg'],
    '3D Models': ['3d-1.jpg', '3d-2.jpg', '3d-3.jpg', '3d-4.jpg'],
    'animations': ['animation-1.jpg', 'animation-2.jpg', 'animation-3.jpg', 'animation-4.jpg']
  };

  getThumbnailUrl(productName: string, category: string = 'art'): string {
    try {
      // Use placehold.co which is more reliable
      return `${this.fallbackBaseUrl}/400x300/6366F1/FFFFFF.png?text=${encodeURIComponent(productName)}`;
    } catch (error) {
      console.warn('Error generating thumbnail URL:', error);
      return DEFAULT_PRODUCT_IMAGE;
    }
  }

  getSampleImage(index: number, productName: string, category: string = 'art'): string {
    try {
      // Use placehold.co with index in the text
      return `${this.fallbackBaseUrl}/200x150/6366F1/FFFFFF.png?text=${encodeURIComponent(`${productName} ${index}`)}`;
    } catch (error) {
      console.warn('Error generating sample image URL:', error);
      return DEFAULT_PRODUCT_IMAGE;
    }
  }
} 