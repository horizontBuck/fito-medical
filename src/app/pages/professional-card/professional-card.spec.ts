import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalCard } from './professional-card';

describe('ProfessionalCard', () => {
  let component: ProfessionalCard;
  let fixture: ComponentFixture<ProfessionalCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionalCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
