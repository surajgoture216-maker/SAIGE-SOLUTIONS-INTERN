import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimPending } from './claim-pending';

describe('ClaimPending', () => {
  let component: ClaimPending;
  let fixture: ComponentFixture<ClaimPending>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimPending],
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimPending);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
