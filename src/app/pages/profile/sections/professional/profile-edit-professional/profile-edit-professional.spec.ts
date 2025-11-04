import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileEditProfessional } from './profile-edit-professional';

describe('ProfileEditProfessional', () => {
  let component: ProfileEditProfessional;
  let fixture: ComponentFixture<ProfileEditProfessional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileEditProfessional]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileEditProfessional);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
