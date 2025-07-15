import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControleAComponent } from './controle-a.component';

describe('ControleAComponent', () => {
  let component: ControleAComponent;
  let fixture: ComponentFixture<ControleAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ControleAComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ControleAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
