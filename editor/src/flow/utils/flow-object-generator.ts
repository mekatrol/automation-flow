import { FunctionType } from '../types/FunctionType';
import { BlockSide } from '../types/BlockSide';
import { InputOutputDirection } from '../types/InputOutputDirection';
import { InputOutputSignalType } from '../types/InputOutputSignalType';
import { InputOutput } from '../types/InputOutput';
import { UIBlockConnectorElement } from '../types/UIBlockConnectorElement';
import { FlowFunction } from '../types/FlowFunction';
import { v4 as uuidv4 } from 'uuid';
import { UIElement } from '../types/UIElement';

export interface BlockConfiguration {
  attributes: Record<string, any>;
}

export const generateFunctionBlock = (type: FunctionType, parent: UIElement | undefined, data?: BlockConfiguration | undefined): FlowFunction => {
  switch (type) {
    case FunctionType.And:
      return generateAndBlock(parent, data);
    case FunctionType.Average:
      return generateAverageBlock(parent, data);
    case FunctionType.Calculator:
      return generateCalculatorBlock(parent, data);
    case FunctionType.Calendar:
      return generateCalendarBlock(parent, data);
    case FunctionType.Clamp:
      return generateClampBlock(parent, data);
    case FunctionType.Comparator:
      return generateComparatorBlock(parent, data);
    case FunctionType.Delay:
      return generateDelayBlock(parent, data);
    case FunctionType.If:
      return generateIfBlock(parent, data);
    case FunctionType.Invert:
      return generateInvertBlock(parent, data);
    case FunctionType.Max:
      return generateMaxBlock(parent, data);
    case FunctionType.Min:
      return generateMinBlock(parent, data);
    case FunctionType.Or:
      return generateOrBlock(parent, data);
    case FunctionType.Override:
      return generateOverrideBlock(parent, data);
    case FunctionType.Pid:
      return generatePidBlock(parent, data);
    case FunctionType.Pulse:
      return generatePulseBlock(parent, data);
    case FunctionType.Schedule:
      return generateScheduleBlock(parent, data);
    case FunctionType.Selector:
      return generateSelectorBlock(parent, data);
    case FunctionType.Sequence:
      return generateSequenceBlock(parent, data);
    case FunctionType.Span:
      return generateSpanBlock(parent, data);
    case FunctionType.Split:
      return generateSplitBlock(parent, data);
    case FunctionType.Timer:
      return generateTimerBlock(parent, data);
    case FunctionType.Xnor:
      return generateXnorBlock(parent, data);
    case FunctionType.Xor:
      return generateXorBlock(parent, data);
    default:
      throw new Error(`Unknown block type '${type}'`);
  }
};

const generateAndBlock = (parent: UIElement | undefined, _data: BlockConfiguration | undefined): FlowFunction => {
  return generate2InputBinaryBlock(FunctionType.And, parent, _data);
};

const generateAverageBlock = (parent: UIElement | undefined, _data: BlockConfiguration | undefined): FlowFunction => {
  return {} as FlowFunction;
};

const generateCalculatorBlock = (parent: UIElement | undefined, _data: BlockConfiguration | undefined): FlowFunction => {
  return {} as FlowFunction;
};

const generateCalendarBlock = (parent: UIElement | undefined, _data: BlockConfiguration | undefined): FlowFunction => {
  return {} as FlowFunction;
};

const generateClampBlock = (parent: UIElement | undefined, _data: BlockConfiguration | undefined): FlowFunction => {
  return {} as FlowFunction;
};

const generateComparatorBlock = (parent: UIElement | undefined, _data: BlockConfiguration | undefined): FlowFunction => {
  return {} as FlowFunction;
};

const generateDelayBlock = (parent: UIElement | undefined, data: BlockConfiguration | undefined): FlowFunction => {
  return generate1InputBinaryBlock(FunctionType.Delay, parent, data);
};

const generateIfBlock = (parent: UIElement | undefined, _data: BlockConfiguration | undefined): FlowFunction => {
  return {} as FlowFunction;
};

const generateInvertBlock = (parent: UIElement | undefined, data: BlockConfiguration | undefined): FlowFunction => {
  return generate1InputBinaryBlock(FunctionType.Invert, parent, data);
};

const generateSpanBlock = (parent: UIElement | undefined, _data: BlockConfiguration | undefined): FlowFunction => {
  return {} as FlowFunction;
};

const generateMaxBlock = (parent: UIElement | undefined, _data: BlockConfiguration | undefined): FlowFunction => {
  return {} as FlowFunction;
};

const generateMinBlock = (parent: UIElement | undefined, _data: BlockConfiguration | undefined): FlowFunction => {
  return {} as FlowFunction;
};

const generateOrBlock = (parent: UIElement | undefined, data: BlockConfiguration | undefined): FlowFunction => {
  return generate2InputBinaryBlock(FunctionType.Or, parent, data);
};

const generateOverrideBlock = (parent: UIElement | undefined, _data: BlockConfiguration | undefined): FlowFunction => {
  return {} as FlowFunction;
};

const generatePidBlock = (parent: UIElement | undefined, _data: BlockConfiguration | undefined): FlowFunction => {
  return {} as FlowFunction;
};

const generatePulseBlock = (parent: UIElement | undefined, data: BlockConfiguration | undefined): FlowFunction => {
  return generate1InputBinaryBlock(FunctionType.Pulse, parent, data);
};

const generateScheduleBlock = (parent: UIElement | undefined, _data: BlockConfiguration | undefined): FlowFunction => {
  return {} as FlowFunction;
};

const generateSelectorBlock = (parent: UIElement | undefined, _data: BlockConfiguration | undefined): FlowFunction => {
  return {} as FlowFunction;
};

const generateSequenceBlock = (parent: UIElement | undefined, _data: BlockConfiguration | undefined): FlowFunction => {
  return {} as FlowFunction;
};

const generateSplitBlock = (parent: UIElement | undefined, _data: BlockConfiguration | undefined): FlowFunction => {
  return {} as FlowFunction;
};

const generateTimerBlock = (parent: UIElement | undefined, _data: BlockConfiguration | undefined): FlowFunction => {
  return {} as FlowFunction;
};

const generateXnorBlock = (parent: UIElement | undefined, data: BlockConfiguration | undefined): FlowFunction => {
  return generate1InputBinaryBlock(FunctionType.Xnor, parent, data);
};

const generateXorBlock = (parent: UIElement | undefined, data: BlockConfiguration | undefined): FlowFunction => {
  return generate1InputBinaryBlock(FunctionType.Xor, parent, data);
};

const generate1InputBinaryBlock = (type: FunctionType, parent: UIElement | undefined, data: BlockConfiguration | undefined): FlowFunction => {
  const typeUpper = type.toString().toUpperCase();

  const flowFunction = {
    id: data?.attributes['id'] ?? uuidv4(),
    label: data?.attributes['label'] ?? '',
    description: data?.attributes['description'] ?? '',
    type: type,
    connectors: [
      new UIBlockConnectorElement(
        uuidv4(),
        'Input 1',
        `Binary input of ${typeUpper} gate`,
        BlockSide.Left,
        new InputOutput(InputOutputSignalType.Digital, InputOutputDirection.Input)
      ),
      new UIBlockConnectorElement(
        uuidv4(),
        'Output',
        `Binary output of ${typeUpper} gate`,
        BlockSide.Right,
        new InputOutput(InputOutputSignalType.Digital, InputOutputDirection.Output)
      )
    ]
  } as FlowFunction;

  flowFunction.connectors.forEach((c) => (c.parent = parent));

  return flowFunction;
};

const generate2InputBinaryBlock = (type: FunctionType, parent: UIElement | undefined, data: BlockConfiguration | undefined): FlowFunction => {
  const typeUpper = type.toString().toUpperCase();

  const flowFunction = {
    id: data?.attributes['id'] ?? uuidv4(),
    label: data?.attributes['label'] ?? typeUpper,
    description: data?.attributes['description'] ?? '',
    type: type,
    connectors: [
      new UIBlockConnectorElement(
        uuidv4(),
        'Input 1',
        `Binary input 1 of ${typeUpper} gate`,
        BlockSide.Left,
        new InputOutput(InputOutputSignalType.Digital, InputOutputDirection.Input)
      ),
      new UIBlockConnectorElement(
        uuidv4(),
        'Input 2',
        `Binary input 2 of ${typeUpper} gate`,
        BlockSide.Left,
        new InputOutput(InputOutputSignalType.Digital, InputOutputDirection.Input)
      ),
      new UIBlockConnectorElement(
        uuidv4(),
        'Output',
        `Binary output of ${typeUpper} gate`,
        BlockSide.Right,
        new InputOutput(InputOutputSignalType.Digital, InputOutputDirection.Output)
      )
    ]
  } as FlowFunction;

  flowFunction.connectors.forEach((c) => (c.parent = parent));

  return flowFunction;
};
