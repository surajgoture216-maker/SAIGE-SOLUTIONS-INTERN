import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimPreview } from './claim-preview';

describe('ClaimPreview', () => {
  let component: ClaimPreview;
  let fixture: ComponentFixture<ClaimPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimPreview],
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
