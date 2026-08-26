export class AgentRunNotFoundError extends Error {
  readonly status = 404;

  constructor() {
    super('Project not found');
    this.name = 'AgentRunNotFoundError';
  }
}

export class AgentRunConflictError extends Error {
  readonly status = 409;
  
  constructor() {
    super('A run is already in progress for this project');
    this.name = 'AgentRunConflictError';
  }
}
