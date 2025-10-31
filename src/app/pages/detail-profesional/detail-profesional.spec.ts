import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailProfesional } from './detail-profesional';

describe('DetailProfesional', () => {
  let component: DetailProfesional;
  let fixture: ComponentFixture<DetailProfesional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailProfesional]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailProfesional);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
