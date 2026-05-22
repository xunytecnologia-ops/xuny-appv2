# Deploy (VPS via SSH + Docker)

## Pré-requisitos na VPS
- Docker Engine instalado
- Docker Compose plugin (`docker compose`)
- Portas liberadas no firewall:
  - 80/443 (se for colocar domínio/HTTPS com proxy)
  - ou 5000 (se for acessar direto na porta)

## 1) Clonar o projeto na VPS
```bash
mkdir -p /var/www/xuny-appv2
cd /var/www/xuny-appv2
git clone https://github.com/xunytecnologia-ops/xuny-appv2.git .
```

## 2) Criar variáveis de ambiente do backend (NÃO COMMITAR)
Crie o arquivo:
```bash
mkdir -p server
nano server/.env
```

Exemplo (ajuste com seus valores):
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://SEU-DOMINIO.com

MONGODB_URI=mongodb+srv://...
SESSION_SECRET=uma_senha_grande_aqui

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://SEU-DOMINIO.com/auth/google/callback
```

## 3) Subir com Docker
Ainda em `/var/www/xuny-appv2`:
```bash
docker compose up -d --build
docker compose ps
```

Health check:
```bash
curl -i http://127.0.0.1:5000/health
```

## 4) Atualizar (deploy) quando fizer git push
Na VPS:
```bash
cd /var/www/xuny-appv2
git pull
docker compose up -d --build
```

## 5) Produção com domínio (recomendado)
Use Nginx/Apache como proxy reverso para `http://127.0.0.1:5000`.

Nginx (exemplo):
```nginx
server {
  server_name SEU-DOMINIO.com;

  location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Com HTTPS (Let’s Encrypt):
```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d SEU-DOMINIO.com
```

## Observações importantes
- O frontend em produção é servido pelo próprio Node/Express (o build vai para `dist/` e o backend entrega o SPA).
- Os endpoints existem no backend em:
  - `/auth/*`
  - `/api/gmail`
  - `/api/drive`
  - `/api/reminders`
- Se você acessar o frontend pelo domínio, o browser vai chamar a API no mesmo domínio (sem `localhost`).
