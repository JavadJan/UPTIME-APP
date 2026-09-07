.DEFAULT_GOAL := up

.PHONY: up down build logs ps migrate clean help

up: ## Build (if needed) and start db, backend, and frontend together
	docker compose up --build

down: ## Stop all containers
	docker compose down

build: ## Rebuild images without starting them
	docker compose build

logs: ## Tail logs from every service
	docker compose logs -f

ps: ## List running services
	docker compose ps

migrate: ## First-time setup (or after a schema change): create/apply Prisma migrations
	docker compose run --rm backend npx prisma migrate dev --name init

clean: ## Stop containers and delete the Postgres volume - destroys all data
	docker compose down -v

help: ## List available commands
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*##"}; {printf "  %-10s %s\n", $$1, $$2}'
