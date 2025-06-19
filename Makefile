# Makefile with help command

# Default target is help
.PHONY: all
all: help

# Help target
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make publish     - Checkout main branch, bump version, and push changes with tags"
	@echo "  make build       - Compile TypeScript files using tsc"
	@echo "  make help        - Display this help message"
	@echo "  make test        - Run the tests"
	@echo "  make scan        - Check the Docker container for vulnerabilities"
	@echo "  make docker-build - Build Docker image locally"
	@echo "  make docker-rm    - Remove the Docker image"
	@echo "  make docker-prune - Clean up/prune unused Docker data"

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

# Check container for vulnerabilities using Trivy
.PHONY: scan
scan:
	@echo "Scanning Docker image for vulnerabilities..."
	@docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image random-server || echo "Trivy scan failed. Is the image built?"

# Build Docker image locally (runs regular build first)
.PHONY: docker-build
docker-build: build
	@echo "Building Docker image locally..."
	docker build -t random-server .

# Remove Docker image
.PHONY: docker-rm
docker-rm:
	@echo "Removing Docker image..."
	-docker rmi random-server

# Cleanup/prune Docker system
.PHONY: docker-prune
docker-prune:
	@echo "Pruning unused Docker data..."
	docker system prune -f

# Clean build artifacts and dependencies
.PHONY: clean
clean:
	@echo "Cleaning build artifacts and dependencies..."
	rm -rf dist node_modules package-lock.json
