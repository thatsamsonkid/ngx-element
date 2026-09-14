import { Component, EventEmitter, Input, NgModule, Output, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxElementService } from './ngx-element.service';
import { LAZY_CMPS_PATH_TOKEN } from './tokens';

@Component({
  selector: 'test-standalone',
  standalone: true,
  template: `<p>{{ title }}</p>`
})
class TestStandaloneComponent {
  @Input() title = '';
  @Output() tagClick = new EventEmitter<string>();
}

@Component({
  selector: 'test-module-cmp',
  standalone: true,
  template: `<p>{{ name }}</p>`
})
class TestModuleComponent {
  @Input() name = '';
}

@NgModule({
  imports: [TestModuleComponent]
})
class TestLazyModule {
  customElementComponent: Type<unknown> = TestModuleComponent;
}

describe('NgxElementService', () => {
  let service: NgxElementService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LAZY_CMPS_PATH_TOKEN,
          useValue: [
            {
              selector: 'standalone-hello',
              loadComponent: () => Promise.resolve(TestStandaloneComponent)
            },
            {
              selector: 'module-hello',
              loadChildren: () => Promise.resolve(TestLazyModule)
            }
          ]
        }
      ]
    });
    service = TestBed.inject(NgxElementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should lazy-load a standalone component via loadComponent', async () => {
    const event = await service.loadComponent('standalone-hello');
    expect(event.selector).toBe('standalone-hello');
    expect(event.componentClass).toBe(TestStandaloneComponent);
  });

  it('should lazy-load a component from an NgModule via loadChildren', async () => {
    const event = await service.loadComponent('module-hello');
    expect(event.selector).toBe('module-hello');
    expect(event.componentClass).toBe(TestModuleComponent);
  });

  it('should return the cached component on subsequent loads', async () => {
    const first = await service.loadComponent('standalone-hello');
    const second = await service.loadComponent('standalone-hello');
    expect(second.componentClass).toBe(first.componentClass);
  });

  it('should reject an unknown selector', async () => {
    await expect(service.loadComponent('missing')).rejects.toThrowError(
      /Unrecognized component "missing"/
    );
  });
});
