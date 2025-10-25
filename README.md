# Le Drone Hub 🚁

A modern drone sales and rental platform built with Medusa.js and Next.js.

## Demo Links

- Frontend: [https://test-lazone-ui.denver-dev.com](https://test-lazone-ui.denver-dev.com)
- Medusa Backend: [https://es48ck8csw044o8gss0wokog.dexchange.sn](https://es48ck8csw044o8gss0wokog.dexchange.sn)

## Prerequisites 📋

- Docker
- Docker Compose
- Git

## Docker Installation 🐳

1. **Clone the repository**

```bash
git clone https://github.com/Denver-sn/test-lazone-dev.git
cd test-lazone-dev
```

2. **Environment Variables Setup**

Create a `.env` file in the `web` directory:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Create a `.env` file in the `medusa` directory:

```env
DATABASE_TYPE=postgres
DATABASE_URL=postgres://postgres:postgres@postgres:5432/medusa
REDIS_URL=redis://redis:6379
```

3. **Launch with Docker Compose**

```bash
docker-compose up --build
```

The application will be available at:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Medusa Backend: [http://localhost:9000](http://localhost:9000)

## Local Development 💻

To run the project in development mode:

1. **Medusa Backend**

```bash
cd medusa
yarn install
npx medusa exec ./src/scripts/seed.ts

medusa develop
```

Create an admin account and then genereate publishable key in the dashboard admin

```
npx medusa user -e admin@local.dev -p Passw0rd!
```

2. **Next.js Frontend**

```bash
cd web
yarn install
yarn dev
```

## Tech Stack 🛠️

- **Frontend**

  - Next.js 14
  - TypeScript
  - Tailwind CSS
  - Medusa UI Components

- **Backend**
  - Medusa.js
  - PostgreSQL
  - Redis

## Core Features 🎯

- Multilingual support (FR/EN)
- Unified cart management (purchases and rentals)
- Booking system with date selection
- Automatic rental price calculation
- Admin interface for product management
- Responsive and modern design

## Key Components

- **Product Management**

  - Dynamic product catalog
  - Multilingual product descriptions
  - Price management for both sales and rentals

- **Cart System**

  - Mixed cart supporting both purchases and rentals
  - Real-time price calculations
  - Quantity management
  - Rental period selection

- **User Interface**
  - Language switcher
  - Responsive navigation
  - Modern and clean design
  - Loading states and animations

## API Integration

The application integrates with a Medusa backend through:

- Product endpoints for catalog management
- Cart endpoints for purchase and rental management
- Custom endpoints for rental-specific features
