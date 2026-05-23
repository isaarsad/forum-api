# Forum API - Clean Architecture

## 🚀 Overview

A robust and scalable RESTful API for a forum application. Built with strict adherence to **Clean Architecture** principles and **Test-Driven Development (TDD)**, this project demonstrates a highly decoupled, maintainable, and testable backend system.

---

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Architecture:** Clean Architecture
- **Infrastructure:** Docker & Docker Compose
- **Testing:** Vitest
- **Documentation:** Swagger (OpenAPI 3.0)

---

## ✨ Features

### 🔐 Authentication

- User registration
- Login & logout
- JWT authentication using Access Token & Refresh Token

### 🧵 Thread Management

- Create new threads
- Retrieve thread details

### 💬 Comment System

- Add comments to threads
- Delete comments
- Like comment

### ↩️ Reply System

- Add replies to comments
- Delete replies

### 🛡 Authorization

- Users can only modify or delete their own comments and replies

---

## 📦 Getting Started

### Prerequisites

No need to install Node.js or PostgreSQL locally. Docker exists so developers can stop turning their laptop into a dependency landfill.

Make sure you have:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/isaarsad/forum-api
cd forum-api
```

### 2. Configure Environment Variables

Copy the .env.example file into .env.

```bash
cp .env.example .env
```

Then configure the required environment variables.

> Make sure the database host matches the database service name defined in docker-compose.yml.

### 3. Build and Run Containers

Start the application and database containers in detached mode.

```bash
docker-compose up -d --build
```

### 4. Run Database Migrations

Execute the migration script inside the running application container.

> Replace api with your actual application service name from docker-compose.yml.

```bash
docker-compose exec forum-api npm run migrate -- up
```

### 5. Access the Application

The server should now be running at:

```bash
http://localhost:3000
```

## 🧪 Testing

Run automated tests inside the Docker environment.

### Run All Tests

```bash
docker-compose exec forum-api npm run test
```

### Run Tests with Coverage

```bash
docker-compose exec forum-api npm run test:coverage
```

## 📖 API Documentation

This project uses Swagger for interactive API documentation.

Make sure the containers are running, then open:

```bash
http://localhost:3000/api-docs
```

You can explore and test API endpoints directly from your browser.
