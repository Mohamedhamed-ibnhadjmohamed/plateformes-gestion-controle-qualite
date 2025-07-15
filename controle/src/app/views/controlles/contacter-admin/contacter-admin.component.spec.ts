import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContacterAdminComponent } from './contacter-admin.component';

describe('ContacterAdminComponent', () => {
  let component: ContacterAdminComponent;
  let fixture: ComponentFixture<ContacterAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContacterAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContacterAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
