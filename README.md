# Bolt 2.0

Bolt 2.0 is a web-based application that allows you to build other web applications by chatting with an AI. You can describe the application you want to build in a prompt, and the AI will generate the code, dependencies, and project structure for you. You can then see the live-running application and the code in a Sandpack environment.

## Technologies Used

*   **Next.js**: A React framework for building server-side rendered and statically generated web applications.
*   **Convex**: A backend-as-a-service platform for building full-stack applications.
*   **Clerk**: User management and authentication.
*   **Google Generative AI**: For generating code and project structure from user prompts.
*   **Sandpack**: A component for creating live-running code examples.
*   **Zustand**: A small, fast and scaleable bearbones state-management solution.
*   **Shadcn UI**: A collection of re-usable components that you can copy and paste into your apps.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom user interfaces.

## Getting Started

To get started with Bolt 2.0, you'll need to have Node.js and npm installed on your machine.

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/bolt-2.0.git
    ```

2.  Install the dependencies:

    ```bash
    cd bolt-2.0
    npm install
    ```

3.  Set up your environment variables. Create a `.env.local` file in the root of the project and add the following:

    ```
    # Clerk
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
    CLERK_SECRET_KEY=

    # Convex
    NEXT_PUBLIC_CONVEX_URL=

    # Google Generative AI
    GOOGLE_API_KEY=
    ```

4.  Run the development server:

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:3000`.

## Features

*   **AI-powered code generation**: Describe your application in a prompt and let the AI generate the code for you.
*   **Live-running application**: See your application running live in a Sandpack environment.
*   **Code editor**: View and edit the generated code.
*   **Authentication**: User authentication and management with Clerk.
*   **Convex backend**: A full-stack backend with a database and serverless functions.