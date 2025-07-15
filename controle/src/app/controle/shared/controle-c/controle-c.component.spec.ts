import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControleCComponent } from './controle-c.component';

describe('ControleCComponent', () => {
  let component: ControleCComponent;
  let fixture: ComponentFixture<ControleCComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ControleCComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ControleCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
