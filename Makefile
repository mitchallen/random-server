# Makefile with help command

# Default target is help
.PHONY: all
all: help

# Help target
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make publish   - Checkout main branch, bump version, and push changes with tags"
	@echo "  make build     - Compile TypeScript files using tsc"
	@echo "  make help      - Display this help message"
	@echo "  make test      - Run the tests"

# Define the publish target
.PHONY: publish
publish:
	@echo "Switching to main branch..."
	git checkout main
	@echo "Incrementing version..."
	npm version patch
	@echo "Pushing changes and tags..."
	git push && git push --tags

# Define the build target
.PHONY: build
build:
	@echo "Compiling TypeScript..."
	npm run build
	@echo "TypeScript compilation complete!"

# Define the test target
.PHONY: test
test:
	@echo "Running tests..."
	npm test
