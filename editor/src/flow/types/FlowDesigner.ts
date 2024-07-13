import { computed, type Ref, ref } from 'vue';
import type { Offset } from './Offset';
import { ZOrder } from './ZOrder';
import type { Line } from './Line';
import { configureFlowMouseEvents } from '../utils/event-emitter';
import type { FlowConnection } from './FlowConnection';
import type { Size } from './Size';
import type { FlowBlockElement } from './FlowBlockElement';
import type { FlowConnecting } from './FlowConnecting';
import { BlockSide } from './BlockSide';
import type { EnumDictionary } from './EnumDictionary';
import { BLOCK_IO_OFFSET, BLOCK_IO_SIZE } from '../constants';
import type { InputOutput } from '../types/InputOutput';

export class FlowDesigner {
  private _viewSize: Ref<{ width: number; height: number }>;
  private _blocks: Ref<FlowBlockElement[]>;
  private _connections: Ref<FlowConnection[]>;
  private _zOrder: ZOrder;
  private _gridSize: Ref<number>;
  private _drawingConnection = ref<FlowConnecting | undefined>(undefined);
  private _drawingConnectionEndBlock = ref<FlowBlockElement | undefined>(undefined);
  private _drawingConnectionEndPin = ref<number | undefined>(undefined);
  private _selectedConnection = ref<FlowConnection | undefined>(undefined);
  private _selectedBlock = ref<FlowBlockElement | undefined>(undefined);
  private _dragBlock = ref<FlowBlockElement | undefined>(undefined);
  private _dragBlockOffset = ref<Offset>({ x: 0, y: 0 });
  private _dragBlockOriginalPosition = ref<Offset>({ x: 0, y: 0 });

  constructor(viewSize: Ref<{ width: number; height: number }>, gridSize: Ref<number>) {
    this._blocks = ref([]);
    this._connections = ref([]);
    this._viewSize = viewSize;
    this._gridSize = gridSize;
    this._zOrder = new ZOrder(this._blocks);
  }

  public get blocks(): Ref<FlowBlockElement[]> {
    return this._blocks;
  }

  public get connections(): Ref<FlowConnection[]> {
    return this._connections;
  }

  public get viewSize(): Ref<{ width: number; height: number }> {
    return this._viewSize;
  }

  public get dragBlock(): Ref<FlowBlockElement | undefined> {
    return this._dragBlock;
  }

  public get dragBlockOriginalPosition(): Ref<Offset> {
    return this._dragBlockOriginalPosition;
  }

  public get dragBlockOffset(): Ref<Offset> {
    return this._dragBlockOffset;
  }

  public get drawingConnection(): Ref<FlowConnecting | undefined> {
    return this._drawingConnection;
  }

  public get selectedBlock(): FlowBlockElement | undefined {
    return this._selectedBlock.value;
  }

  public set selectedBlock(block: FlowBlockElement | undefined) {
    // Clear any existing selections
    this.clearSelectedBlock();

    if (!block) {
      return;
    }

    block.selected = true;
    this._selectedBlock.value = block;
  }

  public get selectedConnection(): FlowConnection | undefined {
    return this._selectedConnection.value;
  }

  public set selectedConnection(connection: FlowConnection | undefined) {
    // Clear any existing selections
    this.clearSelectedConnection();

    if (!connection) {
      return;
    }

    connection.selected = true;
    this._selectedConnection.value = connection;
  }

  public clearSelectedItems(): void {
    // We just try and clear everything so that selections
    // are reset to a known state

    // Clear selected node
    this.clearSelectedBlock();

    // Clear selected connection
    this.clearSelectedConnection();

    // Clear drawing connection
    this.drawingConnection.value = undefined;
    this._drawingConnectionEndBlock.value = undefined;
    this._drawingConnectionEndPin.value = undefined;
  }

  public clearSelectedConnection = (): void => {
    // Clear selected node
    this._selectedConnection.value = undefined;

    if (!this._connections) {
      return;
    }

    // Make sure all are deselected
    this._connections.value.forEach((c) => (c.selected = false));
  };

  public clearSelectedBlock = (): void => {
    // Clear selected node
    this._selectedBlock.value = undefined;

    if (!this._blocks) {
      return;
    }

    // Make sure all are deselected
    this._blocks.value.forEach((b) => (b.selected = false));
  };

  public moveBlockZOrder = (action: string): void => {
    if (!this.selectedBlock || !this._blocks || !this._blocks.value) {
      return;
    }

    this._zOrder.moveBlockZOrder(action, this.selectedBlock);
  };

  public gridLines = computed((): Line[] => {
    const lines: Line[] = [];

    if (this.viewSize.value.height < this._gridSize.value || this.viewSize.value.height < this._gridSize.value) {
      return [];
    }

    for (let y = 0; y < this.viewSize.value.height; y += this._gridSize.value) {
      lines.push({
        start: { x: 0, y: y },
        end: { x: this.viewSize.value.width, y: y }
      });
    }

    for (let x = 0; x < this.viewSize.value.width; x += this._gridSize.value) {
      lines.push({
        start: { x: x, y: 0 },
        end: { x: x, y: this.viewSize.value.height }
      });
    }

    return lines;
  });

  public dragBlockMove = (e: MouseEvent): void => {
    if (!this._dragBlock.value) return;
    this._dragBlock.value.location.x = e.offsetX - this._dragBlockOffset.value.x;
    this._dragBlock.value.location.y = e.offsetY - this._dragBlockOffset.value.y;
  };

  public dragConnectionMove = (e: MouseEvent): void => {
    if (!this.drawingConnection.value) return;

    // Get starting io
    const startBlock = this.drawingConnection.value.startBlock;
    const startInputOutput = startBlock.io.find((io) => io.pin === this.drawingConnection.value!.startPin)!;

    // Is there an element at the mouse position (that is not the drawing connection)
    const hitInputOutputs = this.getHitInputOutputs(e).filter(
      ([block, io]) =>
        // Don't hit test the starting io
        block != startBlock && io != startInputOutput
    );

    // We only use the first entry
    const [block, inputOutput] = hitInputOutputs.length > 0 ? hitInputOutputs[0] : [];

    // Set values (may be undefined)
    this._drawingConnectionEndBlock.value = block;
    this._drawingConnectionEndPin.value = inputOutput?.pin;

    // Update end offset to mouse offset
    this.drawingConnection.value.endLocation = { x: e.offsetX, y: e.offsetY };

    if (!block || !inputOutput) {
      // Clear any existing styles / hit info
      this.drawingConnection.value.cssClasses = '';

      return;
    }

    // Set css extra if is hovering over valid io (connection is compatible for io types)
    this.drawingConnection.value.cssClasses = inputOutput && this.canConnect(inputOutput, startInputOutput) ? 'valid-end-point' : '';
  };

  public dragConnectionCreateConnection = (): void => {
    if (!this._drawingConnection.value || !this._drawingConnectionEndPin.value) {
      return;
    }

    const startBlock = this._drawingConnection.value.startBlock;
    const startBlockPin = this._drawingConnection.value?.startPin;
    const endBlock = this._drawingConnectionEndBlock.value!;
    const endBlockPin = this._drawingConnectionEndPin.value;

    const connection = {
      startBlockId: startBlock.id,
      startPin: startBlockPin,
      endBlockId: endBlock.id,
      endPin: endBlockPin
    } as FlowConnection;

    this._connections.value.push(connection);
  };

  public canConnect = (from: InputOutput, to: InputOutput): boolean => {
    // Connection must be between io is opposite direction
    if (from.direction === to.direction) {
      return false;
    }

    // Connectors must have logic type match (eg, analogue / digital compatibility)
    if (from.type != to.type) {
      return false;
    }

    // Connectors cannot already be connected
    if (this.isConnectorConnected(from) || this.isConnectorConnected(from)) {
      return false;
    }

    return true;
  };

  public getConnectionStartInputOutput(connection: FlowConnection): InputOutput {
    const startBlock = this.blocks.value.find((b) => b.id === connection.startBlockId)!;
    return startBlock.io.find((io) => io.pin === connection.startPin)!;
  }

  public getConnectionStartOffset(connection: FlowConnection): Offset {
    const startBlock = this.blocks.value.find((b) => b.id === connection.startBlockId)!;
    const startInputOutput = startBlock.io.find((io) => io.pin == connection.startPin)!;
    return {
      x: startBlock.location.x + startInputOutput.location.x,
      y: startBlock.location.y + startInputOutput.location.y + startInputOutput.size.height / 2
    };
  }

  public getConnectionEndInputOutput(connection: FlowConnection): InputOutput {
    const endBlock = this.blocks.value.find((b) => b.id === connection.endBlockId)!;
    return endBlock.io.find((io) => io.pin === connection.endPin)!;
  }

  public getConnectionEndOffset(connection: FlowConnection): Offset {
    const endBlock = this.blocks.value.find((b) => b.id === connection.endBlockId)!;
    const endInputOutput = endBlock.io.find((io) => io.pin == connection.endPin)!;
    return {
      x: endBlock.location.x + endInputOutput.location.x,
      y: endBlock.location.y + endInputOutput.location.y + endInputOutput.size.height / 2
    };
  }

  public isConnectorConnected = (inputOutput: InputOutput): boolean => {
    let isConnected = false;
    this._connections.value.forEach((c) => {
      if (this.getConnectionStartInputOutput(c) === inputOutput || this.getConnectionEndInputOutput(c) === inputOutput) {
        isConnected = true;
        return;
      }
    });

    return isConnected;
  };

  public getBoundingBox(location: Offset, size: Size): { left: number; top: number; right: number; bottom: number } {
    return {
      left: location.x, // left
      top: location.y, // top
      right: location.x + size.width, // right
      bottom: location.y + size.height // bottom
    };
  }

  public boundingBoxContainsOffset(boundingBox: { left: number; top: number; right: number; bottom: number }, offset: Offset): boolean {
    // Check if offset within bounds (including boundary itself)
    return offset.x >= boundingBox.left && offset.x <= boundingBox.right && offset.y >= boundingBox.top && offset.y <= boundingBox.bottom;
  }

  public getHitInputOutputs = (e: MouseEvent): [FlowBlockElement, InputOutput][] => {
    const hitInputOutputs: [FlowBlockElement, InputOutput][] = [];

    this._blocks.value.forEach((block) => {
      // Convert mouse location to offset relative to block location for block input/output hit testing
      const blockRelativeOffset: Offset = { x: e.offsetX - block.location.x, y: e.offsetY - block.location.y };

      // Are any input/output hit?
      (block as FlowBlockElement).io.forEach((io) => {
        const boundingBox = this.getBoundingBox(io.location, io.size);
        if (this.boundingBoxContainsOffset(boundingBox, blockRelativeOffset)) {
          hitInputOutputs.push([block, io]);
        }
      });
    });

    return hitInputOutputs;
  };

  // Whenever mouse is clicked anywhere in the designer
  // allows clearing any currently selected node when clicking
  // on designer background (ie not on a node)
  public mouseDown = (e: MouseEvent): void => {
    if (e.target instanceof SVGElement || e.target instanceof HTMLElement) {
      const element = e.target as HTMLElement | SVGElement;

      // Focus the element (which will focus the parent SVG element)
      element.focus({
        preventScroll: true
      });

      // If the actual SVG element was clicked on then clear any selected items
      if (element.tagName === 'svg') {
        this.clearSelectedItems();
      }
    }
  };

  public mouseUp = (e: MouseEvent): void => {
    this._dragBlock.value = undefined;

    if (this.drawingConnection.value && this._drawingConnectionEndPin.value) {
      this.dragConnectionCreateConnection();
    }

    if (e.target instanceof Element) {
      const element = e.target as Element;
      if (element.tagName === 'svg') {
        this.clearSelectedBlock();
      }
    }

    // Clear drawing connection
    this.drawingConnection.value = undefined;
  };

  public mouseMove = (e: MouseEvent): void => {
    // Is there a connection being drawn
    if (this.drawingConnection.value) {
      this.dragConnectionMove(e);
      return;
    }
    this.dragBlockMove(e);
  };

  public mouseLeave = (_: MouseEvent): void => {
    this.dragBlock.value = undefined;
    this.drawingConnection.value = undefined;
  };

  public keyPress = (_e: KeyboardEvent): void => {
    // console.log('keyPress', _e);
  };

  public keyDown = (_e: KeyboardEvent): void => {
    // console.log('keyDown', _e);
  };

  public keyUp = (e: KeyboardEvent): void => {
    if (e.key === 'Delete') {
      if (this._selectedBlock.value) {
        this.deleteSelectedBlock();
      } else if (this._selectedConnection.value) {
        this.deleteSelectedConnection();
      }
    }
  };

  public deleteSelectedBlock = (): void => {
    // Can only delete the selected node if a node is actually selected
    if (!this._selectedBlock.value) {
      return;
    }

    // Delete selected node
    this.deleteBlock(this._selectedBlock.value);

    // Clear any selections
    this.clearSelectedItems();
  };

  public deleteSelectedConnection = (): void => {
    // Can only delete the selected connection if a connection is actually selected
    if (!this._selectedConnection.value) {
      return;
    }

    // Delete selected connection
    this.deleteConnection(this._selectedConnection.value);

    // Clear any selections
    this.clearSelectedItems();
  };

  public deleteBlock = (block: FlowBlockElement): void => {
    // We must also delete any connections that connect to the node
    const connections = this._connections.value.filter((c) => c.startBlockId === block.id || c.endBlockId === block.id);
    connections.forEach((c) => this.deleteConnection(c));

    // Filter nodes to the set without the node
    this._blocks.value = this._blocks.value.filter((b) => b != block);
  };

  public deleteConnection = (connection: FlowConnection): void => {
    // Filter connections to the set without the connection
    this._connections.value = this._connections.value.filter((c) => c != connection);
  };

  private getInputOutputOffsets(size: Size, offset: number): EnumDictionary<BlockSide, Offset> {
    const inputOutputOffsets: EnumDictionary<BlockSide, Offset> = {
      [BlockSide.Left]: { x: -(BLOCK_IO_SIZE - BLOCK_IO_OFFSET), y: offset },
      [BlockSide.Top]: { x: offset, y: -BLOCK_IO_OFFSET },
      [BlockSide.Right]: { x: size.width - BLOCK_IO_OFFSET, y: offset },
      [BlockSide.Bottom]: { x: offset, y: size.height - BLOCK_IO_OFFSET }
    };

    return inputOutputOffsets;
  }

  private layoutInputsOutputsSide(io: InputOutput[], side: BlockSide, inputOutputOffsets: EnumDictionary<BlockSide, Offset>): InputOutput[] {
    const ioForSide = io.filter((io) => io.side === side);

    let shift = 0;
    ioForSide.forEach((io) => {
      const shiftHorizontal = side === BlockSide.Top || side === BlockSide.Bottom;
      const offset = inputOutputOffsets[side];
      io.location = { x: offset.x + (shiftHorizontal ? shift : 0), y: offset.y + (!shiftHorizontal ? shift : 0) };
      shift += BLOCK_IO_SIZE + (BLOCK_IO_SIZE >> 1);
    });

    return ioForSide;
  }

  public layoutInputOutputs = (size: Size, io: InputOutput[]): void => {
    // Get the layout offsets for each side
    const inputOutputOffsets = this.getInputOutputOffsets(size, 5);

    // Layout inputs/outputs on each side
    this.layoutInputsOutputsSide(io, BlockSide.Left, inputOutputOffsets);
    this.layoutInputsOutputsSide(io, BlockSide.Right, inputOutputOffsets);
    this.layoutInputsOutputsSide(io, BlockSide.Top, inputOutputOffsets);
    this.layoutInputsOutputsSide(io, BlockSide.Bottom, inputOutputOffsets);
  };
}

// The singleton flow designer instance
let flowDesigner: FlowDesigner;

// Initialise the designer
export const initFlowDesigner = (screenSize: Ref<{ width: number; height: number }>, gridSize: Ref<number>): FlowDesigner => {
  flowDesigner = new FlowDesigner(screenSize, gridSize);

  // Mouse events
  configureFlowMouseEvents(flowDesigner);

  // Return flow designer instance
  return flowDesigner;
};

// Use the designer methods and values
export const useFlowDesigner = (): FlowDesigner => {
  return flowDesigner;
};