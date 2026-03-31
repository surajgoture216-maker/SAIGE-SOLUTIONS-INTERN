import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-claim-pending',
  standalone: true,
  templateUrl: './claim-pending.html',
  styleUrl: './claim-pending.css'
})
export class ClaimPendingComponent {
  @Output() close = new EventEmitter<void>();

  goBack() {
    this.close.emit();
  }
}