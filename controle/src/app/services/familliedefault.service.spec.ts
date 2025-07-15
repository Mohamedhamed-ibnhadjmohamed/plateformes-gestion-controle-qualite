import { TestBed } from '@angular/core/testing';

import { FamilliedefaultService } from './familliedefault.service';

describe('FamilliedefaultService', () => {
  let service: FamilliedefaultService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FamilliedefaultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
