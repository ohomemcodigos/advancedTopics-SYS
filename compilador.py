import os

# Pastas que não queremos ler
IGNORE_DIRS = {'node_modules', 'dist', '.git', '.husky', 'coverage', 'public'}
# Extensões que importam para o código
ALLOWED_EXTS = {'.ts', '.json', '.html', '.css', '.scss', '.yml', '.sh', '.sql'}

output_file = 'codigo_completo.txt'

with open(output_file, 'w', encoding='utf-8') as outfile:
    for root, dirs, files in os.walk('.'):
        # Remove as pastas ignoradas da busca
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for file in files:
            if any(file.endswith(ext) for ext in ALLOWED_EXTS):
                filepath = os.path.join(root, file)
                
                # Cria um cabeçalho bonitinho para separar os arquivos
                outfile.write(f"\n{'='*60}\n")
                outfile.write(f"ARQUIVO: {filepath}\n")
                outfile.write(f"{'='*60}\n\n")
                
                try:
                    with open(filepath, 'r', encoding='utf-8') as infile:
                        outfile.write(infile.read())
                except Exception as e:
                    outfile.write(f"Erro ao ler arquivo: {e}\n")

print(f"Sucesso! Todos os códigos foram compilados no arquivo '{output_file}'.")