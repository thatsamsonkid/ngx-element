import { NgModule, Injector, ModuleWithProviders } from '@angular/core';
import { NgxElementComponent } from './ngx-element.component';
import { provideNgxElement, registerNgxElement } from './ngx-element.providers';
import { LazyComponentDef } from './tokens';

@NgModule({
  imports: [NgxElementComponent]
})
export class NgxElementModule {
  constructor(injector: Injector) {
    registerNgxElement(injector);
  }

  static forRoot(config: LazyComponentDef[]): ModuleWithProviders<NgxElementModule> {
    return {
      ngModule: NgxElementModule,
      providers: [provideNgxElement(config)]
    };
  }
}
