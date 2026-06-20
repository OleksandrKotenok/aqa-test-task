# Official Playwright image - browsers and OS dependencies are preinstalled.
# The tag matches the @playwright/test version in package.json.
FROM mcr.microsoft.com/playwright:v1.60.0-noble

WORKDIR /app

# Install dependencies first so this layer is cached when only tests change.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the project.
COPY . .

# Run the full Playwright suite by default.
# The Playwright config builds the app and serves it with `vite preview`.
CMD ["npx", "playwright", "test"]
