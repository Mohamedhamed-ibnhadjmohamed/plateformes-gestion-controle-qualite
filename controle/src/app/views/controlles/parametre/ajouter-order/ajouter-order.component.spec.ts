import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterOrderComponent } from './ajouter-order.component';

describe('AjouterOrderComponent', () => {
  let component: AjouterOrderComponent;
  let fixture: ComponentFixture<AjouterOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AjouterOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AjouterOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
