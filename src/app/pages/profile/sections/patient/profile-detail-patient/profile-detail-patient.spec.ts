import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileDetailPatient } from './profile-detail-patient';

describe('ProfileDetailPatient', () => {
  let component: ProfileDetailPatient;
  let fixture: ComponentFixture<ProfileDetailPatient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileDetailPatient]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileDetailPatient);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
