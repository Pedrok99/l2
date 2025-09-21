# Box Packing Microservice

Small NestJS microservice that receives orders (pedidos) and packs products into available boxes.

## Quick start

1. Install dependencies

```bash
npm install
```

2. Run in development

```bash
npm run start:dev
```

3. Build and run (production)

```bash
npm run build
npm run start
```

## Docker

Build image:

```bash
docker build -t box-packing-api .
```

Run container:

```bash
docker run -p 3000:3000 box-packing-api
```

The API will be available at `http://localhost:3000` and Swagger UI at `http://localhost:3000/api`.

## API

POST `/orders/process` - Recebe payload com `pedidos` e retorna o empacotamento (caixas).

Exemplo de payload:

```json
{
  "pedidos": [
    {
      "pedido_id": 1,
      "produtos": [
        { "produto_id": "PS5", "dimensoes": { "altura": 40, "largura": 10, "comprimento": 25 } }
      ]
    }
  ]
}
```

## Tests

Run unit tests:

```bash
npm test
```

Run test coverage:

```bash
npm run test:cov
```

## License

MIT
