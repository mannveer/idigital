import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface PurchasedFile {
  id: number;
  name: string;
  author: string;
  thumbnailUrl: string;
  purchaseDate: Date;
  downloadUrl: string;
  fileSize: string;
  fileType: string;
  description: string;
  license: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private purchasedFilesSubject = new BehaviorSubject<PurchasedFile[]>([]);
  private activeOtps = new Map<string, string>();

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  purchasedFiles$ = this.purchasedFilesSubject.asObservable();

  // Mock data for demonstration
  private mockPurchasedFiles: PurchasedFile[] = [
    {
      id: 1,
      name: 'Modern Dashboard UI Kit',
      author: 'Sarah Johnson',
      thumbnailUrl: 'assets/images/templates/dashboard-ui.jpg',
      purchaseDate: new Date('2024-03-15'),
      downloadUrl: 'assets/files/dashboard-ui.zip',
      fileSize: '245 MB',
      fileType: 'Figma Template',
      description: 'Complete dashboard UI kit with 50+ components and dark mode support',
      license: 'Commercial License'
    },
    {
      id: 2,
      name: 'E-commerce Website Template',
      author: 'Michael Chen',
      thumbnailUrl: 'assets/images/templates/ecommerce.jpg',
      purchaseDate: new Date('2024-03-10'),
      downloadUrl: 'assets/files/ecommerce.zip',
      fileSize: '180 MB',
      fileType: 'HTML/CSS/JS Template',
      description: 'Responsive e-commerce template with React and Tailwind CSS',
      license: 'Commercial License'
    },
    {
      id: 3,
      name: 'Social Media Icon Pack',
      author: 'Design Studio Pro',
      thumbnailUrl: 'assets/images/templates/icons.jpg',
      purchaseDate: new Date('2024-03-08'),
      downloadUrl: 'assets/files/icons.zip',
      fileSize: '45 MB',
      fileType: 'SVG Icons',
      description: '500+ social media icons in multiple styles and colors',
      license: 'Commercial License'
    },
    {
      id: 4,
      name: 'Portfolio Website Theme',
      author: 'Emma Wilson',
      thumbnailUrl: 'assets/images/templates/portfolio.jpg',
      purchaseDate: new Date('2024-03-05'),
      downloadUrl: 'assets/files/portfolio.zip',
      fileSize: '120 MB',
      fileType: 'WordPress Theme',
      description: 'Clean and minimal portfolio theme for creatives',
      license: 'Commercial License'
    }
  ];

  // Mock user data
  private mockUsers = new Map([
    ['test@example.com', { name: 'Test User', verified: true }],
    ['+919876543210', { name: 'Mobile User', verified: true }]
  ]);

  sendOtp(identifier: string): Observable<boolean> {
    // Simulate API call to send OTP
    if (!this.mockUsers.has(identifier)) {
      return throwError(() => new Error('User not found'));
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.activeOtps.set(identifier, otp);

    // Log the OTP for testing (in real app, this would be sent via SMS/email)
    console.log(`OTP for ${identifier}: ${otp}`);

    return of(true).pipe(
      delay(1500),
      tap(() => console.log('OTP sent successfully'))
    );
  }

  verifyOtp(identifier: string, otp: string): Observable<boolean> {
    const storedOtp = this.activeOtps.get(identifier);

    if (!storedOtp || storedOtp !== otp) {
      return throwError(() => new Error('Invalid OTP'));
    }

    // Clear the OTP after successful verification
    this.activeOtps.delete(identifier);

    return of(true).pipe(
      delay(1500),
      tap(() => {
        this.isAuthenticatedSubject.next(true);
        this.purchasedFilesSubject.next(this.mockPurchasedFiles);
      })
    );
  }

  logout(): void {
    this.isAuthenticatedSubject.next(false);
    this.purchasedFilesSubject.next([]);
  }

  getPurchasedFiles(): Observable<PurchasedFile[]> {
    if (!this.isAuthenticatedSubject.value) {
      return throwError(() => new Error('Not authenticated'));
    }
    return of(this.mockPurchasedFiles).pipe(
      delay(1000)
    );
  }

  downloadFile(fileId: number): Observable<boolean> {
    const file = this.mockPurchasedFiles.find(f => f.id === fileId);
    if (!file) {
      return throwError(() => new Error('File not found'));
    }

    // Simulate file download
    console.log('Downloading file:', file.name);
    return of(true).pipe(
      delay(2000),
      tap(() => console.log('File downloaded successfully'))
    );
  }
} 