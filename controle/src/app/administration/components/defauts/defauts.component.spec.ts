import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefautsComponent } from './defauts.component';

describe('DefautsComponent', () => {
  let component: DefautsComponent;
  let fixture: ComponentFixture<DefautsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefautsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DefautsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
