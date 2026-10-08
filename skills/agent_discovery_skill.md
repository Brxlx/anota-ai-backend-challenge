# Agent Discovery Skill

## Overview
This skill enables the discovery and parsing of declared agents and subagents from the `agents.md` documentation file. It extracts structured information about agent types, their purposes, and relationships to optimize system interaction and integration.

## Purpose
The primary goal is to:
1. Parse the agents.md file to identify all declared agents and subagents
2. Extract key information such as agent names, types, purposes, and capabilities
3. Provide a structured representation for efficient agent discovery and usage
4. Enable intelligent routing and selection of appropriate agents based on requirements

## Functionality

### 1. Agent Type Discovery
- Identify core agents (located in `src/core/agents`)
- Identify domain agents (located in `src/domain/agents`) 
- Identify infrastructure agents (located in `src/infra/agents`)

### 2. Agent Information Extraction
For each discovered agent, extract:
- Agent name and full path
- Agent type classification
- Purpose and functionality description
- Input/output specifications
- Dependencies and requirements

### 3. Relationship Mapping
- Identify parent-child relationships between agents
- Map agent hierarchies and dependencies
- Establish communication patterns between agents

## Usage Examples

### Example 1: Basic Agent Discovery
```
skill agent_discovery_skill
{
  "action": "discover_agents",
  "target": "all"
}
```

### Example 2: Type-Specific Discovery  
```
skill agent_discovery_skill
{
  "action": "discover_agents",
  "target": "core",
  "filter": {
    "purpose": "user_management"
  }
}
```

### Example 3: Agent Relationship Mapping
```
skill agent_discovery_skill
{
  "action": "map_relationships",
  "agents": ["UserValidationAgent", "OrderProcessingAgent"]
}
```

## Output Format

The skill returns structured data in the following format:

```json
{
  "agents": [
    {
      "name": "ExampleAgent",
      "type": "core|domain|infra",
      "path": "src/core/agents/example-agent.ts",
      "purpose": "Description of agent's purpose",
      "inputs": ["input1", "input2"],
      "outputs": ["output1", "output2"],
      "dependencies": ["dependency1", "dependency2"],
      "communication_patterns": ["sync", "async"]
    }
  ],
  "relationships": [
    {
      "from": "ParentAgent",
      "to": "ChildAgent",
      "type": "composition|dependency"
    }
  ]
}
```

## Implementation Details

### Parsing Strategy
1. Read the `agents.md` file content
2. Extract agent type sections (Core Agents, Domain Agents, Infrastructure Agents)
3. Parse each agent's definition and extract metadata
4. Build hierarchical structure of agents and their relationships
5. Generate optimized data structures for quick lookup and interaction

### Data Sources
- Primary source: `docs/agents.md`
- Secondary sources: Agent code files (for detailed specifications)
- Configuration files: For agent-specific settings and parameters

## Optimization Benefits

1. **Reduced Search Time**: Pre-parsed agent information enables fast discovery
2. **Intelligent Routing**: System can automatically select appropriate agents based on requirements
3. **Enhanced Integration**: Better understanding of agent capabilities facilitates seamless integration
4. **Dynamic Agent Selection**: System can adaptively choose the best agent for specific tasks
5. **Improved Documentation**: Structured data makes it easier to understand system architecture

## Error Handling
The skill implements robust error handling for:
- Missing or malformed agents.md files
- Incomplete agent definitions
- Parsing errors in documentation
- Invalid filter parameters

## Security Considerations
- Only parse publicly available documentation
- No sensitive information extraction
- Access control for agent-specific functionality
- Secure communication between discovered agents

## Future Enhancements
1. Integration with live agent status monitoring
2. Real-time agent capability updates
3. Advanced filtering and search capabilities
4. Agent performance metrics integration
5. Automated agent recommendation system