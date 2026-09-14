import {
  EnvironmentProviders,
  Injector,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer
} from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { NgxElementComponent } from './ngx-element.component';
import { LAZY_CMPS_PATH_TOKEN, LazyComponentDef } from './tokens';

/**
 * Registers the `<ngx-element>` custom element and the lazy component registry.
 * Use with `createApplication` or `bootstrapApplication` for standalone bootstrap.
 */
export function provideNgxElement(config: LazyComponentDef[]): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: LAZY_CMPS_PATH_TOKEN, useValue: config },
    provideEnvironmentInitializer(() => registerNgxElement(inject(Injector)))
  ]);
}

/** Defines the `ngx-element` custom element once for the given injector. */
export function registerNgxElement(injector: Injector): void {
  if (customElements.get('ngx-element')) {
    return;
  }

  customElements.define(
    'ngx-element',
    createCustomElement(NgxElementComponent, { injector })
  );
}
