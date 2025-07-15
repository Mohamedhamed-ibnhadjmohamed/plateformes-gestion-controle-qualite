import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterfamilleComponent } from './ajouterfamille.component';

describe('AjouterfamilleComponent', () => {
  let component: AjouterfamilleComponent;
  let fixture: ComponentFixture<AjouterfamilleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AjouterfamilleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AjouterfamilleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
