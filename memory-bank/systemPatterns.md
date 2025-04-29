# System Patterns: TutoriaLLM

## System Architecture

TutoriaLLM follows a modern web application architecture with a clear separation between frontend and backend components:

```
TutoriaLLM
├── Frontend (React)
│   ├── Editor Interface
│   │   ├── Blockly Workspace
│   │   └── Dialogue View
│   ├── Admin Interface
│   └── User Management
└── Backend (Node.js)
    ├── API Services
    ├── Database Layer
    ├── Session Management
    ├── VM Execution Environment
    └── AI Integration
```

### High-Level Architecture

1. **Client-Server Model**: The application follows a client-server architecture where the frontend (client) communicates with the backend (server) through RESTful APIs and WebSockets.

2. **Microservices Approach**: The backend is organized into modular services that handle specific aspects of the application (session management, VM execution, etc.).

3. **Real-time Communication**: WebSockets (Socket.io) enable real-time communication between the client and server, particularly important for the interactive dialogue and code execution feedback.

4. **Containerization**: Docker is used for containerization, allowing for easy deployment and scaling.

## Key Technical Decisions

### Frontend

1. **React as UI Framework**: React provides a component-based architecture that enables modular, reusable UI elements and efficient rendering.

2. **Blockly Integration**: Google's Blockly library serves as the foundation for the visual programming environment, offering a mature and extensible block-based coding interface.

3. **State Management with Jotai**: Jotai provides atomic state management that is lightweight and flexible, suitable for the application's needs.

4. **TanStack Router**: Used for type-safe routing with automatic route generation.

5. **TanStack Query**: Handles data fetching, caching, and state management for server data.

6. **Tailwind CSS**: Utility-first CSS framework for consistent styling and rapid UI development.

7. **Radix UI**: Provides accessible, unstyled UI components that can be customized with Tailwind.

8. **Internationalization**: i18next handles multi-language support throughout the application.

### Backend

1. **Node.js Runtime**: Provides a JavaScript runtime for the server, allowing for code sharing between frontend and backend.

2. **Hono Web Framework**: A lightweight, fast web framework for building APIs.

3. **PostgreSQL Database**: Relational database for structured data storage.

4. **Drizzle ORM**: Type-safe database access with schema validation.

5. **Socket.io**: Enables real-time bidirectional communication between client and server.

6. **OpenAI Integration**: Leverages AI capabilities for dialogue-based learning and feedback.

7. **AWS S3 Integration**: Handles file storage for user content and assets.

8. **OpenTelemetry**: Provides observability through metrics, traces, and logs.

## Design Patterns

### Frontend Patterns

1. **Component Composition**: UI elements are built from smaller, reusable components that can be composed together.

2. **Custom Hooks**: Encapsulate and reuse stateful logic across components.

3. **Context Providers**: Manage global state and provide access to shared functionality.

4. **Render Props**: Share code between components using a prop whose value is a function.

5. **Container/Presentational Pattern**: Separation of data fetching and presentation concerns.

### Backend Patterns

1. **Middleware Pattern**: Request processing pipeline with composable middleware functions.

2. **Repository Pattern**: Abstracts data access logic from business logic.

3. **Service Layer**: Encapsulates business logic in service classes.

4. **Dependency Injection**: Components receive their dependencies rather than creating them.

5. **Event-Driven Architecture**: Components communicate through events, particularly for real-time features.

## Component Relationships

### Frontend Components

1. **Editor Interface**:
   - **BlocklyEditor**: Core component for the visual programming environment
   - **DialogueView**: Handles the conversational interface for guidance and feedback
   - **Navbar**: Provides navigation and session controls
   - **PanelGroup**: Manages the resizable layout of the editor

2. **Admin Interface**:
   - **Tables**: Display and manage sessions, users, and content
   - **Forms**: Create and edit resources
   - **Dashboard**: Overview of system activity and metrics

3. **Common Components**:
   - **UI Components**: Buttons, inputs, modals, etc.
   - **Layout Components**: Page structures, navigation elements
   - **Feedback Components**: Notifications, alerts, progress indicators

### Backend Components

1. **API Modules**:
   - **Session**: Manages programming sessions
   - **Admin**: Administrative functions
   - **Config**: System configuration
   - **VM**: Virtual machine execution environment
   - **Health**: System health monitoring
   - **Image**: Image processing and storage

2. **Database Layer**:
   - **Schema**: Defines database structure
   - **Migrations**: Handles database schema changes
   - **Queries**: Encapsulates database operations

3. **Middleware**:
   - **Authentication**: Verifies user identity
   - **Authorization**: Controls access to resources
   - **Logging**: Records system activity
   - **Error Handling**: Processes and formats errors

## Critical Implementation Paths

### Session Creation and Management

1. User initiates a new session
2. Backend creates session record in database
3. Frontend loads Blockly workspace
4. WebSocket connection established for real-time updates
5. Session state synchronized between client and server

### Code Execution Flow

1. User builds program in Blockly workspace
2. Frontend serializes workspace to JSON
3. JSON sent to backend for processing
4. Backend converts blocks to executable code
5. Code executed in VM environment
6. Execution results sent back to frontend
7. Results displayed to user

### Dialogue Interaction

1. User sends message or question
2. Message transmitted to backend via WebSocket
3. Backend processes message (potentially using AI)
4. Response generated and sent back to client
5. Response displayed in dialogue interface
6. Relevant blocks or concepts may be highlighted in workspace

### Tutorial Progression

1. Tutorial content loaded from backend
2. Steps presented to user sequentially
3. User completes tasks in Blockly workspace
4. Progress validated against expected outcomes
5. Feedback provided based on completion status
6. Progress saved to database
7. Next step unlocked upon successful completion
