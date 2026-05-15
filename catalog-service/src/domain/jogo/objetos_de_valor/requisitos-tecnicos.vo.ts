export class RequisitosTecnicos {
  constructor(
    public readonly sistemaOperacional: string,
    public readonly gpu: string,
    public readonly ram: string,
  ) {
    if (!sistemaOperacional || !gpu || !ram) {
      throw new Error('Todos os requisitos técnicos são obrigatórios.');
    }
  }
}
