export class ChaveAtivacao {
  constructor(public readonly codigo: string) {
    if (!codigo || codigo.trim().length === 0) {
      throw new Error('Código de ativação é obrigatório.');
    }
    // Formato esperado: XXXX-XXXX-XXXX (3 grupos de 4 chars separados por hífen)
    const formatoValido = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(codigo);
    if (!formatoValido) {
      throw new Error('Código de ativação deve seguir o formato XXXX-XXXX-XXXX.');
    }
  }

  toString(): string {
    return this.codigo;
  }

  equals(outro: ChaveAtivacao): boolean {
    return this.codigo === outro.codigo;
  }
}
