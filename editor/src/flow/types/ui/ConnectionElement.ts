import type { BlockSide } from './BlockSide';
import { type Offset } from './Offset';
import { BlockElement } from './BlockElement';
import { InputOutputElement } from './InputOutputElement';
import { LabelledElement } from './LabelledElement';
import { ElementType } from './ElementType';
import type { FlowConnection } from '../function/FlowConnection';

export class ConnectionElement extends LabelledElement {
  public _connection: FlowConnection;
  public _startBlock: BlockElement;
  public _endBlock: BlockElement | null;

  constructor(connection: FlowConnection, startBlock: BlockElement, endBlock: BlockElement | null) {
    super(connection.label, connection.description, ElementType.Connection, { x: 0, y: 0 }, { width: 0, height: 0 }); // Start with no size, will calculate later
    this._connection = connection;
    this._startBlock = startBlock;
    this._endBlock = endBlock;
  }

  public get startBlock(): BlockElement {
    return this._startBlock;
  }

  public get startBlockInputOutputId(): string {
    return this._connection.startInputOutputId;
  }

  public getStartOffset(): Offset {
    const startInputOutput = this._startBlock.io.find((c) => c.io.id == this.startBlockInputOutputId)!;
    return {
      x: this._startBlock.location.x + startInputOutput.location.x,
      y: this._startBlock.location.y + startInputOutput.location.y + startInputOutput.size.height / 2
    };
  }

  public getStartSide(): BlockSide {
    const startConnector = this._startBlock.io.find((c) => c.io.id == this.startBlockInputOutputId)!;
    return startConnector.side;
  }

  public getStartInputOutput(): InputOutputElement {
    return this._startBlock.io.find((c) => c.io.id === this.startBlockInputOutputId)!;
  }

  public getEndInputOutput(): InputOutputElement | undefined {
    // If no end block then no end block offset
    if (!this._endBlock) {
      return undefined;
    }

    return this._endBlock.io.find((c) => c.io.id === this.endBlockInputOutputId)!;
  }

  public get endBlock(): BlockElement | undefined {
    // If no end block then no end block offset
    if (!this._endBlock) {
      return undefined;
    }

    return this._endBlock;
  }

  public get endBlockInputOutputId(): string | undefined {
    return this._connection.endInputOutputId;
  }

  public getEndOffset(): Offset | undefined {
    // If no end block then no end block offset
    if (!this._endBlock) {
      // If no end block then we must be creating a connection so return
      // location (which is set to end off connection offset)
      return this.location;
    }

    const endInputOutput = this._endBlock.io.find((c) => c.io.id == this.endBlockInputOutputId)!;
    return {
      x: this._endBlock.location.x + endInputOutput.location.x,
      y: this._endBlock.location.y + endInputOutput.location.y + endInputOutput.size.height / 2
    };
  }

  public getEndSide(): BlockSide | undefined {
    const endConnector = this.endBlock?.io.find((c) => c.io.id == this.endBlockInputOutputId);
    return endConnector?.side;
  }
}