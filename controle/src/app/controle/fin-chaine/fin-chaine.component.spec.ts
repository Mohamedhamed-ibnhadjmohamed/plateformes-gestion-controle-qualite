import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinChaineComponent } from './fin-chaine.component';

describe('FinChaineComponent', () => {
  let component: FinChaineComponent;
  let fixture: ComponentFixture<FinChaineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinChaineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinChaineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
