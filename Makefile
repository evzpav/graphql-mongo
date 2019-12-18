DEFAULT_GOAL := help 

.PHONY: install run-mongo run help

NAME    = graphql-mongo

install: ## install dependencies locally
	npm install

run-mongo: ## run mongo container.
	docker run --rm -d \
		--name mongodb_$(NAME) \
		-p 27017:27017 \
		mongo:3.6 \


remove-mongo: ## run mongo container.
	docker rm -f mongodb_$(NAME)

run: ## run server
	node index.js

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
