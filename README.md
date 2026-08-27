# Forge - AI-powered website builder

[platform](https://forge.harshitrv.com)

<img width="1469" height="834" alt="Image" src="https://github.com/user-attachments/assets/79dafe87-2710-4b25-a128-ab2c2dc58102" />

<!-- <img width="1470" height="836" alt="Screenshot 2025-10-05 at 2 46 32 PM" src="https://github.com/user-attachments/assets/741381cb-7a89-46f9-8948-2d0ff19af024" /> -->

Describe an idea. Forge writes the code, installs packages, and runs the app in its own Kubernetes sandbox. You watch it happen in chat, with a live preview beside it.

## Key Capabilities

- **Isolated sandboxes**: Each project gets its own Kubernetes pod — the agent writes files, installs packages, and runs commands inside it
- **Live preview**: A Vite dev server boots in the sandbox and is reachable at `https://app-{projectId}.forge.harshitrv.com`
- **Streaming runs**: Tool calls and results show up in chat as they happen, not after the agent finishes
