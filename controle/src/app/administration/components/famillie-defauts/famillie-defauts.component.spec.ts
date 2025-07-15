import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamillieDefautsComponent } from './famillie-defauts.component';

describe('FamillieDefautsComponent', () => {
  let component: FamillieDefautsComponent;
  let fixture: ComponentFixture<FamillieDefautsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamillieDefautsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FamillieDefautsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
