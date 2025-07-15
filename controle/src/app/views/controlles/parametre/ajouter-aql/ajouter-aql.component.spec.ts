import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterAqlComponent } from './ajouter-aql.component';

describe('AjouterAqlComponent', () => {
  let component: AjouterAqlComponent;
  let fixture: ComponentFixture<AjouterAqlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AjouterAqlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AjouterAqlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
