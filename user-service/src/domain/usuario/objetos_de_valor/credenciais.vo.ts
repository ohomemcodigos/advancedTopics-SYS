//VO responsável por armazenar as credenciais do usuário.
export class Credenciais{
  constructor(
    public readonly email: string,
    public readonly senhaHash: string){
      if(!email.includes('@')) throw new Error('Email inválido.');
      if(!senhaHash) throw new Error('Senha hash é obrigatória.');
    }
}
