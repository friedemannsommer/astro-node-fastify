# Contributing to Astro Node Fastify

Thank you for your interest in contributing to this Astro adapter.
This document provides guidelines and instructions to help you get started.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork**
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a branch** for your contribution

## Development Workflow

### Setting Up the Development Environment

1. Install the dependencies:
   ```bash
   npm install
   ```

2. Run the tests to ensure everything is working:
   ```bash
   npm test
   ```

### Making Changes

1. Make your changes to the codebase
2. Add or update tests to cover your changes
3. Format and check your code:
   ```bash
   npm run check
   ```
4. Run the tests to ensure they pass:
   ```bash
   npm test
   ```

### Building the Project

You can build the project using:

```bash
npm run build
```

For a clean build:

```bash
npm run build:clean
```

### Commit Guidelines

We use [Changesets](https://github.com/changesets/changesets) to manage versions and changelogs.

1. Stage your changes
2. Create a changeset (skip for minor changes like typo fixes):
   ```bash
   npx changeset
   ```
   Follow the prompts to describe your changes.

3. Commit your changes with a descriptive message:
   ```bash
   git commit -m "feat: add new compression option"
   ```

## Pull Request Process

1. **Update your fork** with the latest changes from the main repository
2. **Push your changes** to your fork
3. **Create a pull request** to the main repository
4. **Describe your changes** in the pull request description
    - What does this PR do?
    - Are there any specific areas that need attention?
    - How was it tested?

## Testing

Run tests with:

```bash
npm test
```

Please ensure all tests pass before submitting your PR. Add new tests for new functionality.

## Documentation

If you're adding new features or changing existing ones, please update the relevant documentation:

1. Update the README.md if needed
2. Add or update TSDoc comments for public APIs
3. Update TypeScript types

You can generate documentation using:

```bash
npm run docs
```

## Release Process

The maintainers will handle releases using Changesets. When your PR is merged:

1. It will be included in the next release
2. The version will be determined based on your changeset
3. The changelog will be updated automatically

The release process uses:

```bash
npm run release
```

## Questions?

If you have any questions or need help, please open an issue in the repository, and we will be happy to help you.

Thank you for contributing.
