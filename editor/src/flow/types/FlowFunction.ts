import type { FunctionType as FunctionType } from './FunctionType';
import { InputOutput } from './InputOutput';
import { FlowBlockConnector } from './FlowBlockConnector';

export class FlowFunction {
  id: string; // A GUID
  label: string;
  description: string;
  type: FunctionType;
  io: InputOutput[];
  connectors: FlowBlockConnector[];
  code: (block: FlowFunction) => void;

  constructor(
    id: string,
    label: string,
    description: string,
    type: FunctionType,
    io: InputOutput[],
    connectors: FlowBlockConnector[],
    code: (block: FlowFunction) => void
  ) {
    this.id = id;
    this.label = label;
    this.description = description;
    this.type = type;
    this.io = io;
    this.connectors = connectors;
    this.code = code;
  }
}