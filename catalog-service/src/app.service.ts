import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getJogos() {
    return [
      { 
        id: '11111111-1111-1111-1111-111111111111', 
        titulo: "Baldur's Gate 3", 
        preco: 199.90, 
        imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg' 
      },
      { 
        id: '22222222-2222-2222-2222-222222222222', 
        titulo: 'Cyberpunk 2077', 
        preco: 159.90, 
        imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg' 
      },
      { 
        id: '33333333-3333-3333-3333-333333333333', 
        titulo: 'Monster Hunter World', 
        preco: 129.90, 
        imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/582010/header.jpg' 
      },
      { 
        id: '44444444-4444-4444-4444-444444444444', 
        titulo: 'Elden Ring', 
        preco: 249.90, 
        imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg' 
      },
      { 
        id: '55555555-5555-5555-5555-555555555555', 
        titulo: 'The Witcher 3: Wild Hunt', 
        preco: 99.90, 
        imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg' 
      },
      { 
        id: '66666666-6666-6666-6666-666666666666', 
        titulo: 'Stardew Valley', 
        preco: 49.90, 
        imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/413150/header.jpg' 
      },
      { 
        id: '77777777-7777-7777-7777-777777777777', 
        titulo: 'Hollow Knight', 
        preco: 46.90, 
        imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/367520/header.jpg' 
      },
      { 
        id: '88888888-8888-8888-8888-888888888888', 
        titulo: 'Red Dead Redemption 2', 
        preco: 299.90, 
        imagem: 'https://cdn.akamai.steamstatic.com/steam/apps/1174180/header.jpg' 
      }
    ];
  }
}