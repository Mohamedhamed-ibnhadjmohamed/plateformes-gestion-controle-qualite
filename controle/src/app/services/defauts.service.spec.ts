import { TestBed } from '@angular/core/testing';

import { DefautsService } from './defauts.service';

describe('DefautsService', () => {
  let service: DefautsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DefautsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
