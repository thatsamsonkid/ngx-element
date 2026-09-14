import type { LazyComponentDef } from 'ngx-element';

export const lazyConfig: LazyComponentDef[] = [
  {
    selector: 'talk',
    loadChildren: () => import('./talk/talk.module').then((m) => m.TalkModule)
  },
  {
    selector: 'sponsor',
    loadComponent: () => import('./sponsor/sponsor.component').then((c) => c.SponsorComponent)
  }
];
