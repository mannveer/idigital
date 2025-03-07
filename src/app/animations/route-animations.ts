import { trigger, transition, style, animate } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
  transition('* => *', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('0.4s ease-in-out', 
      style({ opacity: 1, transform: 'translateY(0)' })
    )
  ])
]);

export const slideInAnimation = trigger('slideInAnimation', [
  transition('* => *', [
    style({ 
      opacity: 0,
      transform: 'translateX(100px)'
    }),
    animate('0.5s ease-out', 
      style({ 
        opacity: 1,
        transform: 'translateX(0)'
      })
    )
  ])
]); 