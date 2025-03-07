export const DEFAULT_PRODUCT_IMAGE = 'https://via.placeholder.com/400x300/6366F1/FFFFFF?text=Digital+Asset';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  sampleImages: string[];
  fileType: string;
  fileSize: string;
  author: string;
  createdAt: Date;
  featured: boolean;
  category: string;
} 