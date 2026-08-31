# GitSense AI

GitSense AI is an AI-powered developer tool that analyzes Git code changes and generates clear, meaningful commit messages.

The project is designed to reduce the time developers spend writing commit messages while keeping them consistent with the actual changes made in the codebase.

## Overview

Writing good commit messages is important for maintaining a readable and useful Git history, but it can become repetitive during daily development.

GitSense AI takes code changes as input, analyzes their context using an LLM, and generates a structured commit message that describes the change.

```text
Git Diff
   |
   v
Frontend
   |
   v
Backend API
   |
   v
Anthropic API
   |
   v
Generated Commit Message
```

## Features

* Analyze Git code changes
* Generate AI-powered commit messages
* Use contextual code changes as the input for the LLM
* Structured backend API for AI requests
* Markdown support for AI responses
* Separate frontend and backend architecture
* Environment-based configuration
* Designed for integration into real Git workflows

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Supabase
* React Markdown

### Backend

* Node.js
* Express
* TypeScript
* Anthropic API
* dotenv
* CORS

## Architecture

GitSense AI is organized as a separate frontend and backend application.

```text
                    GitSense AI
                         |
          +--------------+--------------+
          |                             |
          v                             v
      Frontend                       Backend
      Next.js                        Express
      React                          TypeScript
      TypeScript                         |
          |                              |
          +---------- HTTP API ----------+
                                         |
                                         v
                                  Anthropic API
                                         |
                                         v
                                  AI-generated
                                  commit message
```

The frontend is responsible for the user interface and sending requests to the backend.

The backend handles API requests, prompt construction, communication with the Anthropic API, and returning the generated result.

This separation keeps the AI integration and sensitive configuration on the server side.

## Project Structure

```text
gitsense-ai/
|
├── backend/
│   ├── src/
│   │   ├── prompt/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
|
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env.example
│   └── package.json
|
└── README.md
```

## How It Works

A typical GitSense AI request follows this process:

1. The developer provides a Git diff or code change.
2. The frontend sends the data to the backend API.
3. The backend prepares the prompt and relevant context.
4. The Anthropic API analyzes the changes.
5. GitSense AI receives the generated commit message.
6. The result is returned to the frontend and displayed to the developer.

The goal is not simply to generate text, but to produce a commit message that accurately represents the underlying code change.

## Example

Given a change such as:

```diff
+ Added JWT authentication middleware
+ Added token validation
+ Added unauthorized response handling
```

GitSense AI can generate:

```text
feat(auth): add JWT authentication middleware
```

The generated message is intended to be concise, descriptive, and aligned with the actual implementation.

## Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* Anthropic API key
* Supabase project credentials

### Clone the repository

```bash
git clone https://github.com/ebubekirkarakurt/gitsense-ai.git

cd gitsense-ai
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file using `.env.example` as a reference and add the required environment variables.

Start the development server:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

### Backend

Open a separate terminal:

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a reference and configure the required environment variables.

Start the backend:

```bash
npm run dev
```

## Environment Variables

GitSense AI uses environment variables for API keys, database configuration, and other sensitive settings.

Example environment files are provided in the project.

Never commit real API keys, credentials, or secrets to the repository.

## Development

Run the frontend:

```bash
cd frontend
npm run dev
```

Run the backend:

```bash
cd backend
npm run dev
```

Build the frontend:

```bash
cd frontend
npm run build
```

Build the backend:

```bash
cd backend
npm run build
```

## AI-Assisted Development

GitSense AI is also an exploration of building software with modern AI coding tools.

AI tools can accelerate implementation, but generated code still needs to be reviewed, tested, and corrected by the developer.

During development, the project focuses on:

* Reviewing AI-generated code
* Validating API behavior
* Improving prompts
* Handling unexpected model responses
* Keeping application logic predictable
* Separating AI-generated output from application-level validation

The goal is to use AI as a development tool while maintaining engineering control over the resulting code.

## Future Improvements

Planned improvements include:

* Automated evaluation of generated commit messages
* Conventional Commit validation
* GitHub integration
* Direct Git repository analysis
* Commit history analysis
* Improved prompt and response validation
* Support for additional LLM providers
* Developer productivity insights
* Authentication and user-specific settings

## Contributing

Contributions and suggestions are welcome.

If you find a bug, have an improvement idea, or want to contribute a feature, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
