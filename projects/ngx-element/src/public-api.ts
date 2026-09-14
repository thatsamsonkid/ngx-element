/*
 * Public API Surface of ngx-element
 */

export { NgxElementModule } from './lib/ngx-element.module';
export { provideNgxElement, registerNgxElement } from './lib/ngx-element.providers';
export { NgxElementService } from './lib/ngx-element.service';
export { NgxElementComponent } from './lib/ngx-element.component';
export { LAZY_CMPS_PATH_TOKEN } from './lib/tokens';
export type {
  LazyComponentDef,
  LoadChildrenCallback,
  LoadComponentCallback
} from './lib/tokens';
export type { LazyCmpLoadedEvent } from './lib/lazy-component-loaded-event';
