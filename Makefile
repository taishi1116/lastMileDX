.PHONY: help setup up down restart logs db-shell clean

help:
	@echo "Available commands:"
	@echo "  make setup     - Setup the project (copy env file and start containers)"
	@echo "  make up        - Start Docker containers"
	@echo "  make down      - Stop Docker containers"
	@echo "  make restart   - Restart Docker containers"
	@echo "  make logs      - Show Docker container logs"
	@echo "  make db-shell  - Access MySQL shell"
	@echo "  make clean     - Remove Docker volumes and containers"

setup:
	@echo "Setting up the project..."
	@if [ ! -f .env.local ]; then cp .env.example .env.local; fi
	docker-compose up -d
	@echo "Waiting for MySQL to be ready..."
	@sleep 10
	@echo "Setup complete! You can now run 'npm run dev'"

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

db-shell:
	docker-compose exec mysql mysql -udelivery_user -pdelivery_pass delivery_route_db

clean:
	docker-compose down -v
	rm -rf mysql_data