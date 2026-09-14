import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sponsor',
  standalone: true,
  templateUrl: './sponsor.component.html',
  styleUrl: './sponsor.component.scss'
})
export class SponsorComponent {
  @Input() image = '';
  @Input() name = '';
}
