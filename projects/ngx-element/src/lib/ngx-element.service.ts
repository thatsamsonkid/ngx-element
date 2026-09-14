import {
  Injectable,
  Inject,
  Type,
  EnvironmentInjector,
  createNgModule,
  reflectComponentType
} from '@angular/core';
import { Observable, from } from 'rxjs';
import { LAZY_CMPS_PATH_TOKEN, LazyComponentDef } from './tokens';
import { LazyCmpLoadedEvent } from './lazy-component-loaded-event';

@Injectable({
  providedIn: 'root'
})
export class NgxElementService {
  private readonly componentsToLoad: Map<string, LazyComponentDef>;
  private readonly loadedComponents = new Map<string, Type<unknown>>();
  private readonly elementsLoading = new Map<string, Promise<LazyCmpLoadedEvent>>();
  private readonly injectors = new Map<Type<unknown>, EnvironmentInjector>();

  constructor(
    @Inject(LAZY_CMPS_PATH_TOKEN) defs: LazyComponentDef[],
    private readonly injector: EnvironmentInjector
  ) {
    this.componentsToLoad = new Map(defs.map((def) => [def.selector, def]));
  }

  receiveContext(component: Type<unknown>, injector: EnvironmentInjector): void {
    this.injectors.set(component, injector);
  }

  getInjector(component: Type<unknown>): EnvironmentInjector | undefined {
    return this.injectors.get(component);
  }

  getComponentsToLoad(): Map<string, LazyComponentDef> {
    return this.componentsToLoad;
  }

  getComponentToLoad(selector: string): Observable<LazyCmpLoadedEvent> {
    return from(this.loadComponent(selector));
  }

  /**
   * Lazy-load a component by selector. Supports both NgModules (`loadChildren`)
   * and standalone components (`loadComponent` or a component returned from `loadChildren`).
   */
  loadComponent(componentSelector: string): Promise<LazyCmpLoadedEvent> {
    const pending = this.elementsLoading.get(componentSelector);
    if (pending) {
      return pending;
    }

    if (this.loadedComponents.has(componentSelector)) {
      return Promise.resolve({
        selector: componentSelector,
        componentClass: this.loadedComponents.get(componentSelector)!
      });
    }

    if (!this.componentsToLoad.has(componentSelector)) {
      return Promise.reject(
        new Error(
          `Unrecognized component "${componentSelector}". Make sure it is registered in the component registry`
        )
      );
    }

    const loadPromise = this.loadAndResolve(componentSelector);
    this.elementsLoading.set(componentSelector, loadPromise);
    return loadPromise;
  }

  private async loadAndResolve(componentSelector: string): Promise<LazyCmpLoadedEvent> {
    try {
      const def = this.componentsToLoad.get(componentSelector)!;
      const loader = def.loadComponent ?? def.loadChildren;

      if (!loader) {
        throw new Error(
          `Lazy definition for "${componentSelector}" must provide loadComponent or loadChildren`
        );
      }

      const loaded = this.unwrapExport(await loader());
      const componentClass = this.resolveComponentClass(loaded, componentSelector);

      this.loadedComponents.set(componentSelector, componentClass);
      this.componentsToLoad.delete(componentSelector);
      this.elementsLoading.delete(componentSelector);

      return { selector: componentSelector, componentClass };
    } catch (err) {
      this.elementsLoading.delete(componentSelector);
      throw err;
    }
  }

  private unwrapExport(loaded: unknown): Type<unknown> {
    if (typeof loaded === 'function') {
      return loaded as Type<unknown>;
    }

    if (loaded && typeof loaded === 'object' && 'default' in loaded) {
      return (loaded as { default: Type<unknown> }).default;
    }

    throw new Error('Lazy loader must resolve to a component or NgModule class');
  }

  private resolveComponentClass(type: Type<unknown>, selector: string): Type<unknown> {
    const mirror = reflectComponentType(type);
    if (mirror) {
      if (!mirror.isStandalone) {
        throw new Error(
          `Component "${selector}" is not standalone. Convert it to standalone or lazy-load an NgModule via loadChildren.`
        );
      }

      this.receiveContext(type, this.injector);
      return type;
    }

    const moduleRef = createNgModule(type, this.injector);
    const custom = (moduleRef.instance as {
      customElementComponent?: Type<unknown> | Record<string, Type<unknown>>;
    }).customElementComponent;

    if (!custom) {
      throw new Error(
        `NgModule ${type.name} must expose a customElementComponent property`
      );
    }

    let componentClass: Type<unknown> | undefined;
    if (typeof custom === 'object') {
      componentClass = custom[selector];
      if (!componentClass) {
        throw new Error(
          `You specified multiple component elements in module ${type.name} but there was no match for tag ` +
            `"${selector}" in ${JSON.stringify(Object.keys(custom))}. ` +
            `Make sure the selector in the module is aligned with the one specified in the lazy module definition.`
        );
      }
    } else {
      componentClass = custom;
    }

    this.receiveContext(componentClass, moduleRef.injector);
    return componentClass;
  }
}
