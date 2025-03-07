export const DEFAULT_PRODUCT_IMAGE = 'https://placehold.co/400x300/6366F1/FFFFFF.png?text=Digital+Asset';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  fileType: string;
  fileSize: string;
  author: string;
  createdAt: Date;
  featured: boolean;
  category: string;
  thumbnailUrl: string;
  sampleImages: string[];
} 