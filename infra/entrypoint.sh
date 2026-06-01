#!/bin/bash
# Inicia o SQL Server em background
/opt/mssql/bin/sqlservr &
MSSQL_PID=$!

echo "Aguardando SQL Server inicializar..."
for i in $(seq 1 30); do
  /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "MasterKey@123!" -C -Q "SELECT 1" > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "SQL Server pronto. Executando init.sql..."
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "MasterKey@123!" -C -i /home/mssql/init.sql
    echo "Banco de dados inicializado com sucesso."
    break
  fi
  echo "Tentativa $i/30 — SQL Server ainda não está pronto..."
  sleep 3
done

# Mantém o processo principal em foreground
wait $MSSQL_PID
