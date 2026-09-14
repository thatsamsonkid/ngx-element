import { InjectionToken, Type } from '@angular/core';

/** Injection token to provide the lazy component registry. */
export const LAZY_CMPS_PATH_TOKEN = new InjectionToken<LazyComponentDef[]>(
  'ngx-lazy-cmp-registry'
);

/** Dynamically import an NgModule that exposes `customElementComponent`. */
export type LoadChildrenCallback = () => Promise<Type<unknown>>;

/** Dynamically import a standalone component. */
export type LoadComponentCallback = () => Promise<Type<unknown>>;

export interface LazyComponentDef {
  selector: string;
  /**
   * Lazy-load an NgModule. The module instance must expose
   * `customElementComponent` as a component type or a selector-to-type map.
   */
  loadChildren?: LoadChildrenCallback;
  /**
   * Lazy-load a standalone component directly, without an NgModule wrapper.
   */
  loadComponent?: LoadComponentCallback;
}
