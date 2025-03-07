import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly fallbackBaseUrl = 'https://placehold.co';

  getThumbnailUrl(productName: string): string {
    try {
      // Use placehold.co which is more reliable
      return `${this.fallbackBaseUrl}/400x300/6366F1/FFFFFF.png?text=${encodeURIComponent(productName)}`;
    } catch (error) {
      console.warn('Error generating thumbnail URL:', error);
      return `${this.fallbackBaseUrl}/400x300/6366F1/FFFFFF.png?text=Digital+Asset`;
    }
  }

  getSampleImage(index: number, productName: string): string {
    try {
      // Use placehold.co with index in the text
      return `${this.fallbackBaseUrl}/200x150/6366F1/FFFFFF.png?text=${encodeURIComponent(`${productName} ${index}`)}`;
    } catch (error) {
      console.warn('Error generating sample image URL:', error);
      return `${this.fallbackBaseUrl}/200x150/6366F1/FFFFFF.png?text=Sample+${index}`;
    }
  }
} 