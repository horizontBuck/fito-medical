import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profesionals } from './profesionals';

describe('Profesionals', () => {
  let component: Profesionals;
  let fixture: ComponentFixture<Profesionals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profesionals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Profesionals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
