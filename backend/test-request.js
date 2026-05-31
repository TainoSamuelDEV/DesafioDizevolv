const http = require('http');

console.log('Iniciando teste de requisição ao BFF...');

http.get('http://localhost:3001/api/tasks', (res) => {
  console.log(`Status da resposta: ${res.statusCode}`);
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Resposta recebida com sucesso!');
    console.log('Tamanho dos dados:', data.length);
    console.log('Dados resumidos:', data.substring(0, 200));
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('Erro na requisição:', err.message);
  process.exit(1);
});
