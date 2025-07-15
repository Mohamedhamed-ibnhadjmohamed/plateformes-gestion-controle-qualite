import { TestBed } from '@angular/core/testing';

import { AqlsService } from './aqls.service';

describe('AqlsService', () => {
  let service: AqlsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AqlsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
