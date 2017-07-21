/** Description of a workflow state. */
export interface WorkflowState {
  /** Unique id of this workflow state. */
  id: string;

  /** Human-readable name of this workflow state. */
  caption: string;

  /** Whether this state is closed or open. */
  closed?: boolean;

  /** List of states which can follow this state. */
  transitions: string[];
}

/** List of permissible actions for each workflow state. */
export interface WorkflowAction {
  /** Title of this action. */
  caption: string;

  /** State to transition to. */
  state?: string;

  /** Owner to assign to. */
  owner?: string;

  /** Prerequisites for this action. */
  require?: {
    /** List of allowable states for this action. */
    state?: string[];
  };
}

/** Issue workflow definition, determines how issues may change state. */
export interface Workflow { // tslint:disable:export-name
  /** Name of this workflow. */
  name: string;

  /** Project where this workflow is defined. */
  project: string;

  /** Workflow that this is an extension of. */
  extends?: string;

  /** Starting states of this workflow (from which the user can choose). */
  start?: string[];

  /** List of valid states for this workflow. */
  states: WorkflowState[];

  /** List of shortcut actions for this workflow. */
  actions: WorkflowAction[];
}
