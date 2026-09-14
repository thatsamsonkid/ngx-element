import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxElementComponent } from './ngx-element.component';
import { LAZY_CMPS_PATH_TOKEN } from './tokens';

@Component({
  selector: 'test-talk',
  standalone: true,
  template: `<h2>{{ title }}</h2><p>{{ description }}</p><span>{{ speaker }}</span>`
})
class TestTalkComponent {
  private _isTestMode = 'N';
  @Input() set isTestMode(value: string) {
    this._isTestMode = value;
  }
  get isTestMode(): string {
    return this._isTestMode;
  }

  private _title = '';
  @Input() set title(value: string) {
    this._title = value;
    if (this.isTestMode === 'Y') {
      this.tagClick.emit(`{"attrName": "title", "attrValue": "${value}"}`);
    }
  }
  get title(): string {
    return this._title;
  }

  private _description = '';
  @Input() set description(value: string) {
    this._description = value;
    if (this.isTestMode === 'Y') {
      this.tagClick.emit(`{"attrName": "description", "attrValue": "${value}"}`);
    }
  }
  get description(): string {
    return this._description;
  }

  private _speaker = '';
  @Input() set speaker(value: string) {
    this._speaker = value;
    if (this.isTestMode === 'Y') {
      this.tagClick.emit(`{"attrName": "speaker", "attrValue": "${value}"}`);
    }
  }
  get speaker(): string {
    return this._speaker;
  }

  @Output() tagClick = new EventEmitter<string>();
}

describe('NgxElementComponent', () => {
  let component: NgxElementComponent;
  let fixture: ComponentFixture<NgxElementComponent>;

  const inputsAttrs = {
    title: 'Angular Elements',
    description: 'How to write Angular and get Web Components',
    speaker: 'Bruno'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxElementComponent],
      providers: [
        {
          provide: LAZY_CMPS_PATH_TOKEN,
          useValue: [
            {
              selector: 'talk',
              loadComponent: () => Promise.resolve(TestTalkComponent)
            }
          ]
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NgxElementComponent);
    component = fixture.componentInstance;
    component.selector = 'talk';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the lazy standalone component', () => {
    expect(component.componentRef).toBeTruthy();
    component.setAttributes([{ name: 'title', value: inputsAttrs.title }]);
    component.componentRef?.changeDetectorRef.detectChanges();
    fixture.detectChanges();
    const instance = component.componentRef?.instance as { title?: string };
    expect(instance.title).toBe(inputsAttrs.title);
    expect(component.container.length).toBeGreaterThan(0);
    expect(component.componentRef?.location.nativeElement.tagName.toLowerCase()).toBe('test-talk');
  });

  async function expectProxiedAttribute(attr: keyof typeof inputsAttrs): Promise<void> {
    const nativeElement = fixture.nativeElement as HTMLElement;
    const eventPromise = new Promise<string>((resolve) => {
      nativeElement.addEventListener(
        'tagClick',
        (e: Event) => resolve((e as CustomEvent<string>).detail),
        { once: true }
      );
    });

    nativeElement.setAttribute('data-is-test-mode', 'Y');
    nativeElement.setAttribute(`data-${attr}`, inputsAttrs[attr]);

    const outputObject = JSON.parse(await eventPromise) as {
      attrName: string;
      attrValue: string;
    };
    expect(outputObject.attrName).toBe(attr);
    expect(outputObject.attrValue).toBe(inputsAttrs[attr]);
  }

  it('should pass and receive the same "title" attr value', async () => {
    await expectProxiedAttribute('title');
  });

  it('should pass and receive the same "description" attr value', async () => {
    await expectProxiedAttribute('description');
  });

  it('should pass and receive the same "speaker" attr value', async () => {
    await expectProxiedAttribute('speaker');
  });
});
