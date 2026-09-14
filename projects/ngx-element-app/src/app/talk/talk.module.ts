import { NgModule, Type } from '@angular/core';
import { TalkComponent } from './talk.component';

@NgModule({
  imports: [TalkComponent],
  exports: [TalkComponent]
})
export class TalkModule {
  customElementComponent: Type<unknown> = TalkComponent;
}
