import { provideZoneChangeDetection } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { provideNgxElement } from 'ngx-element';
import { lazyConfig } from './app/lazy-config';

createApplication({
  providers: [
    provideZoneChangeDetection(),
    provideNgxElement(lazyConfig)
  ]
}).catch((err) => console.error(err));
