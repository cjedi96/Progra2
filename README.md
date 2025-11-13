# Students API (JWT, Node.js/Express/SQLite)

CRUD de alumnos con autenticación JWT.
Campos de alumnos: **firstName, lastName, carnet, birthDate, isActive**.

## Rápido inicio (local)

```bash
npm install
cp .env.example .env
npm run migrate   # crea DB y usuario admin si configuras variables
npm start
# Swagger en http://localhost:3000/docs
```

Para sembrar el admin, define en `.env`:
```
SEED_ADMIN_USER=admin
SEED_ADMIN_PASS=admin123
SEED_ADMIN_ROLE=admin
```

## Endpoints
- `POST /api/auth/register` (crear usuario)
- `POST /api/auth/login` => `{ accessToken }`
- `GET /api/students` (autenticado) `?page=&limit=&q=`
- `GET /api/students/:id` (autenticado)
- `POST /api/students` (admin)
- `PUT /api/students/:id` (admin)
- `DELETE /api/students/:id` (admin)

## Ejemplos cURL
```bash
# Login (usar admin sembrado)
curl -s http://localhost:3000/api/auth/login   -H "Content-Type: application/json"   -d '{"username":"admin","password":"admin123"}'

# Guardar token
TOKEN="coloca_token_aqui"

# Crear alumno (admin)
curl -s http://localhost:3000/api/students  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json"  -d '{"firstName":"Carlos","lastName":"Martinez","carnet":"20250001","birthDate":"2000-01-31"}'

# Listar
curl -s "http://localhost:3000/api/students?page=1&limit=5&q=Carlos"  -H "Authorization: Bearer $TOKEN"
```

## Despliegue en **AWS Lightsail (Ubuntu)**

1. **Crear instancia** Node/Ubuntu o Ubuntu limpio.
2. **Instalar Node.js LTS**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs
   node -v && npm -v
   ```
3. **Clonar proyecto y configurar**:
   ```bash
   sudo apt-get update && sudo apt-get install -y git
   git clone <TU_REPO> jwt-students-api
   cd jwt-students-api
   npm install
   mkdir -p data
   cp .env.example .env
   # edita .env con un JWT_SECRET fuerte
   npm run migrate
   ```
4. **(Opcional) PM2 para servicio**:
   ```bash
   sudo npm i -g pm2
   pm2 start src/server.js --name students-api
   pm2 save
   pm2 startup  # sigue instrucciones para habilitar al arrancar
   ```
5. **(Opcional) Nginx reverse proxy + HTTPS (Let’s Encrypt)**:
   ```bash
   sudo apt-get install -y nginx
   sudo tee /etc/nginx/sites-available/students <<'NG'
server {
  listen 80;
  server_name _;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
NG
   sudo ln -sf /etc/nginx/sites-available/students /etc/nginx/sites-enabled/students
   sudo nginx -t && sudo systemctl reload nginx
   # Para HTTPS público: instala certbot y emite certificados
   ```

## Postman
Importa `postman_collection.json` y configura la variable `baseUrl` y el `token` con el valor del login.


## Usuarios genéricos para el examen (sembrados por `npm run migrate`)
- user01 / **pass1234**
- user02 / **pass1234**
- user03 / **pass1234**
- user04 / **pass1234**
- user05 / **pass1234**
- user06 / **pass1234**
- user07 / **pass1234**
- user08 / **pass1234**
- user09 / **pass1234**
- user10 / **pass1234**

> También puedes sembrar un admin adicional con variables `SEED_ADMIN_*`. Por defecto los 10 usuarios son rol `user`.
