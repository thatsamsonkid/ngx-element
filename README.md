# Credits

Thanks to [Juri Strumpflohner](https://github.com/juristr) and [ngx-lazy-el](https://github.com/juristr/ngx-lazy-el)!

Thanks to [Bruno Bradach](https://github.com/brunob15) for creating this version of Juri's implementation for use in non-angular applications.

# Disclaimer

My only contribution here is only in updating dependencies for use in newer angular projects.

# Ngx-El (A.K.A NgxElement)

NgxElement enables to lazy load Angular components in non-angular applications.
The library will register a custom element to which you can pass an attribute to specify what component you want to load.

It's a great way to use Angular in your CMS platform in an efficient manner.

Angular 22 supports **standalone bootstrap** via `createApplication` / `provideNgxElement`, and **lazy-loading standalone components** via `loadComponent`. NgModule-based `loadChildren` continues to work.

## Install Angular Elements

This library depends on Angular Elements. You can install it by running:

```
$ ng add @angular/elements
```

## Installing the library

```
$ npm install ngx-el --save
```

## Usage

### Standalone bootstrap (recommended)

Create the Angular application without a root component and register the lazy map. This is the standalone equivalent of an `AppModule` with an empty `ngDoBootstrap()`.

```
import { provideZoneChangeDetection } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { provideNgxElement } from 'ngx-element';

const lazyConfig = [
  {
    selector: 'talk',
    loadChildren: () => import('./talk/talk.module').then(m => m.TalkModule)
  },
  {
    selector: 'sponsor',
    loadComponent: () => import('./sponsor/sponsor.component').then(c => c.SponsorComponent)
  }
];

createApplication({
  providers: [
    provideZoneChangeDetection(),
    provideNgxElement(lazyConfig)
  ]
});
```

`loadComponent` lazy-loads a **standalone** component. `loadChildren` lazy-loads an **NgModule** that exposes the component to upgrade.

### 1) Lazy-load a standalone component

```
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sponsor',
  standalone: true,
  templateUrl: './sponsor.component.html'
})
export class SponsorComponent {
  @Input() image: string;
  @Input() name: string;
}
```

Register it with `loadComponent` as shown above. No NgModule wrapper is required.

### 2) Lazy-load an NgModule (existing apps)

Expose the Angular Component that should be loaded via a `customElementComponent` property.

```
@NgModule({
  imports: [TalkComponent],
  exports: [TalkComponent]
})
export class TalkModule {
  customElementComponent: Type<any> = TalkComponent;
}
```

You can still bootstrap with an NgModule instead of `createApplication`:

```
@NgModule({
  imports: [
    BrowserModule,
    NgxElementModule.forRoot(lazyConfig)
  ]
})
export class AppModule {
  ngDoBootstrap() {}
}
```

### 3) Use the lazy loaded component

You can load your Angular component by adding an `<ngx-element>` tag to the DOM in your non-angular application like follows:

```
<ngx-element
  selector="talk"
  data-title="Angular Elements"
  data-description="How to write Angular and get Web Components"
  data-speaker="Bruno">
</ngx-element>
```

### 4) Listen to events

You can listen to events emitted by Angular components.

Add an `@Output` event to your component:

```
...
@Output() tagClick: EventEmitter<string> = new EventEmitter();
...
```

Then add an event listener to the `tagClick` event on the appropiate `<ngx-element>` element:

```
const talks = document.querySelector('ngx-element[selector="talk"]');
talks.addEventListener('tagClick', event => {
  const emittedValue = event.detail;
  ...
});
```
