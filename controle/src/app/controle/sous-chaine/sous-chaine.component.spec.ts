import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SousChaineComponent } from './sous-chaine.component';

describe('SousChaineComponent', () => {
  let component: SousChaineComponent;
  let fixture: ComponentFixture<SousChaineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SousChaineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SousChaineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
