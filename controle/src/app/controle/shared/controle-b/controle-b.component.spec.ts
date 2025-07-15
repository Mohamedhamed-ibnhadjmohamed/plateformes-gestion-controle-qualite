import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControleBComponent } from './controle-b.component';

describe('ControleBComponent', () => {
  let component: ControleBComponent;
  let fixture: ComponentFixture<ControleBComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ControleBComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ControleBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
