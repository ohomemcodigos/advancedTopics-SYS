//VO responsável por armazenar as informações de perfil do usuário.
export class Perfil{
   constructor(
      public readonly nome:string,
      public readonly nickname: string,
      public readonly avatarUrl: string,
   ){
      if(!nome) throw new Error('Nome é obrigatório.');
      if(!nickname) throw new Error('Nickname é obrigatório.');
   }
}