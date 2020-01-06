import { TestBed } from '@angular/core/testing';

import { LoadRomService } from './load-rom.service';

describe('LoadRomService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoadRomService = TestBed.get(LoadRomService);
    expect(service).toBeTruthy();
  });
});
