# Makefile for Interview Practice App

# Default port for the server
PORT ?= 8080

# Default target
.PHONY: help
help:
	@echo "Interview Practice App - Makefile"
	@echo ""
	@echo "Available commands:"
	@echo "  make serve     - Start the development server"
	@echo "  make serve PORT=8081  - Start the development server on a specific port"
	@echo "  make clean     - Kill any running Python HTTP servers"
	@echo "  make help      - Show this help message"

# Start the development server
.PHONY: serve
serve:
	@echo "Starting server on http://localhost:$(PORT)"
	@echo "Press Ctrl+C to stop the server"
	python3 -m http.server $(PORT)

# Kill any running Python HTTP servers
.PHONY: clean
clean:
	@echo "Killing any running Python HTTP servers..."
	@-pkill -f "python.*http.server" || true
	@echo "Done."

# Install dependencies (if any were needed in the future)
.PHONY: install
install:
	@echo "No dependencies to install for this project."

# Run tests (placeholder for future use)
.PHONY: test
test:
	@echo "No tests configured for this project."
