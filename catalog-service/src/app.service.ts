import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getJogos() {
    return [
      { 
        id: '11111111-1111-1111-1111-111111111111', 
        titulo: "Baldur's Gate 3", 
        preco: 199.90, 
        imagem: 'https://placehold.co/400x250/1e1e2e/a688fa?text=Baldurs+Gate+3' 
      },
      { 
        id: '22222222-2222-2222-2222-222222222222', 
        titulo: 'Cyberpunk 2077', 
        preco: 159.90, 
        imagem: 'https://placehold.co/400x250/1e1e2e/fdfa66?text=Cyberpunk+2077' 
      },
      { 
        id: '33333333-3333-3333-3333-333333333333', 
        titulo: 'Monster Hunter World', 
        preco: 129.90, 
        imagem: 'https://placehold.co/400x250/1e1e2e/7ee787?text=Monster+Hunter' 
      }
    ];
  }
}