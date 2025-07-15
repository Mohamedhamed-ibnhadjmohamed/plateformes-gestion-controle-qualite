import { TestBed } from '@angular/core/testing';

import { ContacterService } from './contacter.service';

describe('ContacterService', () => {
  let service: ContacterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContacterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
