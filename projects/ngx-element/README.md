# Credits

Thanks to [Juri Strumpflohner](https://github.com/juristr) and [ngx-lazy-el](https://github.com/juristr/ngx-lazy-el)!

Thanks to [Bruno Bradach](https://github.com/brunob15) for creating this version of Juri's implementation [ngx-element](https://github.com/brunob15/ngx-element) for use in non-angular applications.

# Disclaimer

This package is a fork of [ngx-element](https://github.com/brunob15/ngx-element) and my only contribution here is only in updating the project for use in newer angular projects.

# Ngx-El (A.K.A NgxElement)

NgxElement enables to lazy load Angular components in non-angular applications.
The library will register a custom element to which you can pass an attribute to specify what component you want to load.

It's a great way to use Angular in your CMS platform in an efficient manner.

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

### 1) Configure the Module containing the lazy loaded component

First of all, expose the Angular Component that should be loaded via a customElementComponent property.

```
...
@NgModule({
  declarations: [TalkComponent],
  ...
  exports: [TalkComponent],
  entryComponents: [TalkComponent]
})
export class TalkModule {
  customElementComponent: Type<any> = TalkComponent;
  ...
}
```

### 2) Define the lazy component map in your AppModule

Just like with the Angular Router, define the map of component selector and lazy module.

```
const lazyConfig = [
  {
    selector: 'talk',
    loadChildren: () => import('./talk/talk.module').then(m => m.TalkModule)
  }
];

@NgModule({
  ...,
  imports: [
    ...,
    NgxElementModule.forRoot(lazyConfig)
  ],
  ...
})
export class AppModule {
  ...
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
