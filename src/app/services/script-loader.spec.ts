import { TestBed } from '@angular/core/testing';

import { ScriptLoader } from './script-loader';

describe('ScriptLoader', () => {
  let service: ScriptLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScriptLoader);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
