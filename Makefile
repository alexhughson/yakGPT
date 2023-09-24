
.PHONY: run
run:
	docker build -t yakgpt .
	docker compose up -d
