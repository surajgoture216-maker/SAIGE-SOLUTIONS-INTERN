import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Claim, ClaimListItem } from '../../models/claim.model';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {

  private baseUrl = 'https://saw2tp9yja.execute-api.ap-south-1.amazonaws.com/api/v1/warranty-management';

  constructor(private http: HttpClient) {}

  getAllClaims(): Observable<ClaimListItem[]> {
    return this.http.post<ClaimListItem[]>(
      `${this.baseUrl}/get-all-claims`, {}
    );
  }

  getClaimById(id: string): Observable<Claim> {
    return this.http.post<Claim>(
      `${this.baseUrl}/get-claim-by-id`,
      { id: id }
    );
  }
}