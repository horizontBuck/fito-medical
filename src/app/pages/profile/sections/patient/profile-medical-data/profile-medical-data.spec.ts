import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileMedicalData } from './profile-medical-data';

describe('ProfileMedicalData', () => {
  let component: ProfileMedicalData;
  let fixture: ComponentFixture<ProfileMedicalData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileMedicalData]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileMedicalData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
