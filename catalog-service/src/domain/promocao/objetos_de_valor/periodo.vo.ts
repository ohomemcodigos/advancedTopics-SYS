export class Periodo{
   constructor(
      public readonly dataInicio: Date,
      public readonly dataFim: Date
   ){
      if(dataInicio >= dataFim) throw new Error('Data de início deve ser anterior à data de fim.');
   }
   data (data: Date): boolean {
      return data >= this.dataInicio && data <= this.dataFim;//Checa se a data fornecida está dentro do período definido.
   }
}