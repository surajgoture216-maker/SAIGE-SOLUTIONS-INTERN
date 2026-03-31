import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClaimService } from '../../core/services/claim';
import { ClaimListItem } from '../../models/claim.model';
import { ClaimPreviewComponent } from '../claim-preview/claim-preview';
import { ClaimPendingComponent } from '../claim-pending/claim-pending';

@Component({
  selector: 'app-claim-list',
  standalone: true,
  imports: [CommonModule, ClaimPreviewComponent, ClaimPendingComponent],
  templateUrl: './claim-list.html',
  styleUrl: './claim-list.css'
})
export class ClaimListComponent implements OnInit {
  claims = signal<ClaimListItem[]>([]);
  loading = signal(true);
  error = signal('');
  showModal = signal(false);
  selectedClaimId = signal('');
  selectedStatus = signal('');

  constructor(private claimService: ClaimService) {}

  ngOnInit() {
    this.claimService.getAllClaims().subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.claims.set(response);
        } else if (response?.data && Array.isArray(response.data)) {
          this.claims.set(response.data);
        } else {
          this.claims.set([]);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load claims.');
        this.loading.set(false);
      }
    });
  }

  onClaimClick(claim: ClaimListItem) {
    this.selectedClaimId.set(claim._id);
    this.selectedStatus.set(claim.warrantyStatus);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedClaimId.set('');
    this.selectedStatus.set('');
  }
}