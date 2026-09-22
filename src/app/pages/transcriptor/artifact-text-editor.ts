import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import {
  NgxMoveableModule,
} from 'ngx-moveable';

export interface ArtifactFragmentWordPosition {
  start: number;
  length: number;
  x: number;
  y: number;
  flip: number;
}

interface FragmentView extends ArtifactFragmentWordPosition {
  text: string;
  index: number;
}

@Component({
  selector: 'app-artifact-text-editor',
  standalone: true,

  imports: [
    NgxMoveableModule,
  ],

  template: `
    <div
      #canvas
      class="artifact-canvas"
      (click)="onCanvasClick($event)"
    >

      @for (fragment of views; track fragment.index) {
        <span
          #fragmentElement
          class="artifact-fragment"
          [class.measuring]="measuring"
          [class.selected]="selectedIndex === fragment.index"
          [attr.data-fragment-index]="fragment.index"

          [style.left.px]="
            measuring ? null : fragment.x
          "

          [style.top.px]="
            measuring ? null : fragment.y
          "

          [style.transform]="
            measuring
              ? null
              : 'rotate(' + fragment.flip + 'deg)'
          "

          (click)="onFragmentClick($event, fragment)"
        >
          {{ fragment.text }}
        </span>
      }

      @if (selectedElement) {
        <ngx-moveable
          [target]="selectedElement"

          [draggable]="true"
          [rotatable]="true"

          [resizable]="false"
          [scalable]="false"
          [warpable]="false"
          [pinchable]="false"

          [origin]="true"
          [edge]="false"

          [throttleDrag]="1"
          [throttleRotate]="1"

          (drag)="onDrag($event)"
          (rotate)="onRotate($event)"
        />
      }

    </div>
  `,

  styles: [`
    :host {
      display: block;
    }

    .artifact-canvas {
      position: relative;
      width: 100%;
      min-height: 300px;

      /*
       * É importante preservar whitespace enquanto
       * estamos fazendo a medição inicial.
       */
      white-space: pre-wrap;

      overflow: hidden;
      user-select: none;
    }

    /*
     * Estado temporário usado somente durante
     * a medição inicial.
     */
    .artifact-fragment.measuring {
      position: static;
      display: inline;
    }

    /*
     * Depois da medição cada fragmento passa a
     * ser independente.
     */
    .artifact-fragment:not(.measuring) {
      position: absolute;
      display: inline-block;

      white-space: pre;

      transform-origin: center center;

      cursor: pointer;
    }

    .artifact-fragment.selected {
      outline: 1px dashed #1976d2;
      outline-offset: 2px;
    }
  `],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtifactTextEditorComponent implements AfterViewInit {

  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLElement>;

  @ViewChildren('fragmentElement')
  fragmentElements!: QueryList<
    ElementRef<HTMLElement>
  >;

  private _text = '';

  @Input({ required: true })
  set text(value: string) {
    this._text = value ?? '';

    if (this.initialized && this._fragments.length === 0) {
      this.initializeFromText();
    }
  }

  get text(): string {
    return this._text;
  }

  private _fragments: ArtifactFragmentWordPosition[] = [];

  @Input()
  set fragments(
    value: ArtifactFragmentWordPosition[] | null | undefined,
  ) {
    this._fragments = (value ?? []).map(fragment => ({
      ...fragment,
    }));

    if (!this.initialized) {
      return;
    }

    if (this._fragments.length === 0) {
      this.initializeFromText();
    } else {
      this.buildViews();
    }
  }

  get fragments(): ArtifactFragmentWordPosition[] {
    return this._fragments;
  }

  @Output()
  fragmentsChange = new EventEmitter<ArtifactFragmentWordPosition[]>();

  views: FragmentView[] = [];

  selectedIndex: number | null = null;

  selectedElement: HTMLElement | null = null;

  measuring = false;

  private initialized = false;

  constructor(
    private cdr: ChangeDetectorRef,
  ) {}

  // ---------------------------------------------------------
  // Inicialização
  // ---------------------------------------------------------

  ngAfterViewInit(): void {
    this.initialized = true;

    if (this._fragments.length === 0) {
      this.initializeFromText();
    } else {
      this.buildViews();
    }
  }

  private initializeFromText(): void {
    this._fragments = this.tokenizeText();

    this.measuring = true;

    this.buildViews();

    /*
     * Precisamos deixar o Angular criar os spans antes
     * de tentar medir seus bounding rects.
     */
    this.cdr.detectChanges();

    requestAnimationFrame(() => {
      this.measureFragments();
    });
  }

  // ---------------------------------------------------------
  // Tokenização
  // ---------------------------------------------------------

  private tokenizeText(): ArtifactFragmentWordPosition[] {
    const fragments: ArtifactFragmentWordPosition[] = [];

    /*
     * Cada match representa um fragmento visual.
     *
     * - palavras
     * - espaços
     * - TAB
     * - newline
     *
     * Uma sequência de espaços é mantida como um único
     * fragmento para não criar centenas de elementos
     * desnecessários.
     */
    const regex =
      /\t|\r\n|[\r\n]| +|[^\s]+/g;

    let match: RegExpExecArray | null;

    while (
      (match = regex.exec(this._text)) !== null
    ) {
      fragments.push({
        start: match.index,
        length: match[0].length,

        x: 0,
        y: 0,

        flip: 0,
      });
    }

    return fragments;
  }

  // ---------------------------------------------------------
  // View model
  // ---------------------------------------------------------

  private buildViews(): void {
    this.views = this._fragments.map(
      (fragment, index) => ({
        ...fragment,

        text: this._text.substring(
          fragment.start,
          fragment.start + fragment.length,
        ),

        index,
      }),
    );

    this.cdr.markForCheck();
  }

  // ---------------------------------------------------------
  // Medição inicial
  // ---------------------------------------------------------

  private measureFragments(): void {
    const canvas =
      this.canvas.nativeElement;

    const canvasRect =
      canvas.getBoundingClientRect();

    const elements =
      this.fragmentElements.toArray();

    if (
      elements.length !==
      this._fragments.length
    ) {
      requestAnimationFrame(() => {
        this.measureFragments();
      });

      return;
    }

    this._fragments =
      this._fragments.map(
        (fragment, index) => {
          const rect =
            elements[index]
              .nativeElement
              .getBoundingClientRect();

          return {
            ...fragment,

            x:
              rect.left -
              canvasRect.left,

            y:
              rect.top -
              canvasRect.top,

            flip: 0,
          };
        },
      );

    /*
     * A partir deste momento os spans deixam
     * de participar do layout normal.
     */
    this.measuring = false;

    this.buildViews();

    this.cdr.detectChanges();

    /*
     * A lista inicial passa para o componente pai.
     */
    this.emitFragments();
  }

  // ---------------------------------------------------------
  // Seleção
  // ---------------------------------------------------------

  onFragmentClick(
    event: MouseEvent,
    fragment: FragmentView,
  ): void {
    event.stopPropagation();

    this.selectFragment(fragment.index);
  }

  private selectFragment(index: number): void {
    this.selectedIndex = index;

    const element =
      this.fragmentElements
        .get(index)
        ?.nativeElement ?? null;

    this.selectedElement = element;

    this.cdr.markForCheck();
  }

  onCanvasClick(event: MouseEvent): void {
    if (
      event.target ===
      this.canvas.nativeElement
    ) {
      this.clearSelection();
    }
  }

  private clearSelection(): void {
    this.selectedIndex = null;
    this.selectedElement = null;

    this.cdr.markForCheck();
  }

  // ---------------------------------------------------------
  // Drag
  // ---------------------------------------------------------

  onDrag(event: any): void {
    if (this.selectedIndex === null) {
      return;
    }

    const index = this.selectedIndex;

    /*
     * ngx-moveable fornece a posição calculada.
     *
     * Mantemos x/y como dados persistentes, em vez
     * de depender da transformação interna do Moveable.
     */
    this._fragments[index] = {
      ...this._fragments[index],

      x: event.left,
      y: event.top,
    };

    this.buildViews();

    this.emitFragments();
  }

  // ---------------------------------------------------------
  // Rotate
  // ---------------------------------------------------------

  onRotate(event: any): void {
    if (this.selectedIndex === null) {
      return;
    }

    const index = this.selectedIndex;

    this._fragments[index] = {
      ...this._fragments[index],

      flip: event.rotation,
    };

    this.buildViews();

    this.emitFragments();
  }

  // ---------------------------------------------------------
  // API pública
  // ---------------------------------------------------------

  rotateSelected(degrees: number): void {
    if (this.selectedIndex === null) {
      return;
    }

    const index = this.selectedIndex;

    this._fragments[index] = {
      ...this._fragments[index],

      flip:
        this._fragments[index].flip +
        degrees,
    };

    this.buildViews();

    this.emitFragments();
  }

  setRotation(degrees: number): void {
    if (this.selectedIndex === null) {
      return;
    }

    const index = this.selectedIndex;

    this._fragments[index] = {
      ...this._fragments[index],

      flip: degrees,
    };

    this.buildViews();

    this.emitFragments();
  }

  // ---------------------------------------------------------
  // Output
  // ---------------------------------------------------------

  private emitFragments(): void {
    this.fragmentsChange.emit(
      this._fragments.map(fragment => ({
        ...fragment,
      })),
    );
  }
}
