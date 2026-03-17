import { Credenciais } from "../objetos_de_valor/credenciais.vo"
import { Regiao } from "../objetos_de_valor/regiao.vo"
import { Perfil } from "../objetos_de_valor/perfil.vo"

export class Usuario{
   constructor(
      public readonly usuarioId: string, // UUID
      public readonly dataCriacaoConta: Date,
      public credenciais: Credenciais,
      public perfil: Perfil,
      public regiao: Regiao
   ){
         if(!usuarioId) throw new Error('ID do usuário é obrigatório.');
   }
}