import { ElementType } from './ElementType';
import { BlockSide } from './BlockSide';
import { InputOutputElement } from './InputOutputElement';
import { InputOutputDirection } from '../InputOutputDirection';
import type { FlowBlockElement } from '../FlowBlockElement';
import type { FlowFunction } from '../FlowFunction';
import type { Offset } from './Offset';
import type { Size } from './Size';

export class BlockElement implements FlowBlockElement {
  public functionId: string;
  public flowFunction: FlowFunction;
  public io: InputOutputElement[];

  public zBoost: number = 0;
  public zOrder: number = 0;
  public z: number = 0;

  public icon: string;

  public location: Offset;
  public size: Size;
  public type: ElementType;

  public selected: boolean = false;

  constructor(element: FlowBlockElement, icon: string, flowFunction: FlowFunction) {
    this.icon = icon;
    this.flowFunction = flowFunction;
    this.functionId = flowFunction.id;
    this.type = ElementType.Block;
    this.location = element.location;
    this.size = element.size;

    this.io = this.flowFunction.io.map(
      (io) => new InputOutputElement(this, io.direction === InputOutputDirection.Input ? BlockSide.Left : BlockSide.Right, io)
    );
  }
}
