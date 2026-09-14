import {
  Component,
  ComponentRef,
  Input,
  Type,
  ViewChild,
  ViewContainerRef,
  OnDestroy,
  AfterViewInit,
  EventEmitter,
  ElementRef,
  EnvironmentInjector,
  reflectComponentType
} from '@angular/core';
import { Subscription, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgxElementService } from './ngx-element.service';

@Component({
  selector: 'lib-ngx-element',
  template: `<ng-template #container></ng-template>`,
  standalone: true
})
export class NgxElementComponent implements AfterViewInit, OnDestroy {
  private ngElementEventsSubscription?: Subscription;
  private attributeObserver?: MutationObserver;

  @Input() selector!: string;
  @ViewChild('container', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;

  componentRef?: ComponentRef<unknown>;
  componentToLoad?: Type<unknown>;
  injector?: EnvironmentInjector;

  constructor(
    private readonly ngxElementService: NgxElementService,
    private readonly elementRef: ElementRef<HTMLElement>
  ) {}

  /**
   * Subscribe to event emitters of a lazy loaded and dynamically instantiated Angular component
   * and dispatch them as Custom Events on the NgxElementComponent that is used in a template.
   */
  private setProxiedOutputs(): void {
    if (!this.componentToLoad || !this.componentRef) {
      return;
    }

    const mirror = reflectComponentType(this.componentToLoad);
    if (!mirror || mirror.outputs.length === 0) {
      return;
    }

    const eventEmitters = mirror.outputs.map(({ propName, templateName }) => {
      const emitter = (this.componentRef!.instance as Record<string, EventEmitter<unknown>>)[
        propName
      ];
      return emitter.pipe(map((value: unknown) => ({ name: templateName, value })));
    });

    this.ngElementEventsSubscription = merge(...eventEmitters).subscribe((subscription) => {
      this.elementRef.nativeElement.dispatchEvent(
        new CustomEvent(subscription.name, { detail: subscription.value })
      );
    });
  }

  ngAfterViewInit(): void {
    this.ngxElementService.getComponentToLoad(this.selector).subscribe((event) => {
      this.componentToLoad = event.componentClass;
      this.injector = this.ngxElementService.getInjector(this.componentToLoad);
      this.createComponent(this.getElementAttributes());
    });
  }

  createComponent(attributes: { name: string; value: string }[]): void {
    this.container.clear();

    this.componentRef = this.container.createComponent(this.componentToLoad!, {
      environmentInjector: this.injector
    });

    this.setAttributes(attributes);
    this.componentRef.changeDetectorRef.detectChanges();
    this.listenToAttributeChanges();
    this.setProxiedOutputs();
  }

  setAttributes(attributes: { name: string; value: string }[]): void {
    attributes.forEach((attr) => {
      (this.componentRef!.instance as Record<string, unknown>)[attr.name] = attr.value;
    });
  }

  getElementAttributes(): { name: string; value: string }[] {
    const attrs = this.elementRef.nativeElement.attributes;
    const attributes: { name: string; value: string }[] = [];

    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];

      if (attr.nodeName.match('^data-')) {
        attributes.push({
          name: this.camelCaseAttribute(attr.nodeName),
          value: attr.nodeValue ?? ''
        });
      }
    }

    return attributes;
  }

  camelCaseAttribute(attribute: string): string {
    const attr = attribute.replace('data-', '');
    const chunks = attr.split('-');

    if (chunks.length > 1) {
      return (
        chunks[0] +
        chunks
          .slice(1)
          .map((chunk) => chunk.replace(/^\w/, (c) => c.toUpperCase()))
          .join('')
      );
    }

    return attr;
  }

  listenToAttributeChanges(): void {
    this.attributeObserver?.disconnect();
    this.attributeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const attributes = this.getElementAttributes();
          this.setAttributes(attributes);
          this.componentRef?.changeDetectorRef.detectChanges();
        }
      });
    });

    this.attributeObserver.observe(this.elementRef.nativeElement, {
      attributes: true
    });
  }

  ngOnDestroy(): void {
    this.attributeObserver?.disconnect();
    this.ngElementEventsSubscription?.unsubscribe();
    this.componentRef?.destroy();
  }
}
