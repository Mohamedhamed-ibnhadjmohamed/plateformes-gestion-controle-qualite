import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AqlsComponent } from './aqls.component';

describe('AqlsComponent', () => {
  let component: AqlsComponent;
  let fixture: ComponentFixture<AqlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AqlsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AqlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
