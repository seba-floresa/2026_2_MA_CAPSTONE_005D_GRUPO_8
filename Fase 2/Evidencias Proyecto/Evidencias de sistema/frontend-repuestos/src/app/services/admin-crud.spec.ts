import { TestBed } from '@angular/core/testing';

import { AdminCrud } from './admin-crud';

describe('AdminCrud', () => {
  let service: AdminCrud;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminCrud);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
