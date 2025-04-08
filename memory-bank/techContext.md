# Technical Context: TutoriaLLM

## Technologies Used

### Frontend

| Category | Technology | Purpose |
|----------|------------|---------|
| **Core Framework** | React 18 | UI component library |
| **Build Tool** | Vite | Fast development and production builds |
| **State Management** | Jotai | Atomic state management |
| **Routing** | TanStack Router | Type-safe routing with automatic route generation |
| **Data Fetching** | TanStack Query | Server state management and data fetching |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **UI Components** | Radix UI | Accessible, unstyled component primitives |
| **Visual Programming** | Blockly | Block-based programming interface |
| **Internationalization** | i18next | Multi-language support |
| **Form Handling** | React Hook Form | Form state management and validation |
| **Schema Validation** | Zod | Runtime type checking and validation |
| **Real-time Communication** | Socket.io Client | WebSocket-based communication |
| **Testing** | Vitest, Playwright | Unit and E2E testing |
| **Flow Visualization** | XY Flow | Node-based flow visualization |
| **PWA Support** | Vite PWA Plugin | Progressive Web App capabilities |

### Backend

| Category | Technology | Purpose |
|----------|------------|---------|
| **Runtime** | Node.js | JavaScript runtime environment |
| **Language** | TypeScript | Type-safe JavaScript superset |
| **Web Framework** | Hono | Lightweight, fast web framework |
| **Database** | PostgreSQL | Relational database |
| **ORM** | Drizzle | Type-safe database access |
| **Real-time Communication** | Socket.io | WebSocket server implementation |
| **AI Integration** | OpenAI SDK | AI capabilities for dialogue and feedback |
| **Storage** | AWS S3 | File storage for user content |
| **Authentication** | Better Auth | Authentication and authorization |
| **Observability** | OpenTelemetry | Metrics, traces, and logs |
| **API Documentation** | OpenAPI, Scalar | API reference and documentation |
| **Error Tracking** | Sentry | Error monitoring and reporting |
| **Media Processing** | Fluent-FFmpeg | Audio/video processing |

### DevOps & Infrastructure

| Category | Technology | Purpose |
|----------|------------|---------|
| **Containerization** | Docker | Application containerization |
| **Package Management** | pnpm | Fast, disk-efficient package manager |
| **Monorepo Management** | pnpm Workspaces | Multi-package repository management |
| **Task Running** | Wireit | Intelligent script running and caching |
| **Code Formatting** | Biome | Fast code formatter and linter |
| **Git Hooks** | Simple Git Hooks | Automated pre-commit and commit-msg hooks |
| **Commit Standards** | Commitizen, Commitlint | Standardized commit messages |
| **Spell Checking** | CSpell | Code and documentation spell checking |

## Development Setup

### Prerequisites

- Node.js (LTS version)
- pnpm package manager
- PostgreSQL database
- Docker and Docker Compose (for containerized development)

### Environment Configuration

The project uses `.env` files for environment configuration:

- `.env.example` - Template for environment variables
- `.env` - Local development environment variables (not committed to version control)
- `.env.test` - Test environment variables

Key environment variables include:

- Database connection details
- API keys for external services (OpenAI, AWS S3)
- Authentication configuration
- Feature flags

### Project Structure

TutoriaLLM follows a monorepo structure using pnpm workspaces:

```
TutoriaLLM/
├── apps/
│   ├── backend/       # Node.js backend application
│   ├── frontend/      # React frontend application
│   └── docs/          # Documentation site
├── packages/
│   └── extensions/    # Shared extension packages
├── package.json       # Root package.json
└── pnpm-workspace.yaml # Workspace configuration
```

### Development Workflow

1. **Setup**: Clone repository and install dependencies
   ```
   git clone https://github.com/TutoriaLLM/TutoriaLLM.git
   cd TutoriaLLM
   pnpm install
   ```

2. **Development**: Start development servers
   ```
   pnpm dev
   ```
   This starts both frontend and backend servers in development mode.

3. **Testing**: Run tests
   ```
   pnpm test
   ```

4. **Building**: Create production builds
   ```
   pnpm build
   ```

5. **Committing**: Use conventional commits
   ```
   pnpm commit
   ```
   This launches the Commitizen CLI for standardized commit messages.

## Technical Constraints

### Performance Constraints

1. **Browser Compatibility**: Must support modern browsers (Chrome, Firefox, Safari, Edge)
2. **Mobile Responsiveness**: Must provide usable experience on tablets and mobile devices
3. **Resource Usage**: Blockly workspace can be resource-intensive, requiring optimization for lower-end devices

### Security Constraints

1. **Data Protection**: Must securely handle student data in compliance with educational privacy standards
2. **Authentication**: Must implement secure authentication and authorization mechanisms
3. **Input Validation**: All user inputs must be validated to prevent injection attacks

### Scalability Constraints

1. **Concurrent Users**: Must support multiple concurrent users in a classroom setting
2. **Database Performance**: Must maintain acceptable query performance as data grows
3. **Resource Scaling**: Must be able to scale resources based on demand

### Deployment Constraints

1. **Self-Hosting**: Must be deployable in various self-hosted environments
2. **Containerization**: Must work reliably in containerized environments
3. **Minimal Dependencies**: Should minimize external dependencies for easier deployment

## Dependencies

### Core Dependencies

- **Blockly**: Foundation for the visual programming environment
- **React**: UI framework for the frontend
- **Node.js**: Runtime for the backend
- **PostgreSQL**: Database for persistent storage
- **Socket.io**: Real-time communication between client and server

### External Services

- **OpenAI API**: Used for AI-powered dialogue and feedback
- **AWS S3**: Used for file storage (optional, can be configured to use local storage)

### Development Dependencies

- **TypeScript**: Type checking and compilation
- **Vite**: Frontend build tool
- **Vitest/Playwright**: Testing frameworks
- **Biome**: Code formatting and linting
- **Drizzle Kit**: Database schema management

## Tool Usage Patterns

### Development Tools

1. **pnpm**: Used for package management and workspace organization
   - `pnpm install` - Install dependencies
   - `pnpm add -w <package>` - Add dependency to root
   - `pnpm add <package> --filter <workspace>` - Add dependency to specific workspace

2. **Wireit**: Used for intelligent script running
   - Defined in `wireit` section of package.json
   - Handles dependencies between scripts
   - Provides caching for faster builds

3. **Biome**: Used for code formatting and linting
   - `pnpm format` - Format code
   - `pnpm check` - Check and fix code issues

4. **Git Hooks**: Automated via simple-git-hooks
   - Pre-commit: Runs formatting, linting, and type checking
   - Commit-msg: Validates commit message format
   - Prepare-commit-msg: Launches Commitizen when needed

### Database Tools

1. **Drizzle ORM**: Used for database access
   - Type-safe query building
   - Schema definition in TypeScript

2. **Drizzle Kit**: Used for database schema management
   - `pnpm drizzle:generate` - Generate migration files
   - `pnpm drizzle:migrate` - Apply migrations
   - `pnpm drizzle:studio` - Launch Drizzle Studio for database management

### Testing Tools

1. **Vitest**: Used for unit and integration testing
   - `pnpm test` - Run all tests
   - Fast, ESM-compatible testing framework

2. **Playwright**: Used for end-to-end testing
   - Browser automation for testing user flows
   - Visual regression testing capabilities

### Deployment Tools

1. **Docker**: Used for containerization
   - `docker-compose.yml` - Main composition file
   - `docker-compose.dev.override.yml` - Development overrides
   - `Dockerfile` and `Dockerfile.dev` - Container definitions

2. **Environment Configuration**: Used for deployment configuration
   - `.env.example` provides template for required variables
   - Different environments can use different `.env` files
