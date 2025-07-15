import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditeComponent } from './audite.component';

describe('AuditeComponent', () => {
  let component: AuditeComponent;
  let fixture: ComponentFixture<AuditeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuditeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
