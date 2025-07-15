import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeControleComponent } from './type-controle.component';

describe('TypeControleComponent', () => {
  let component: TypeControleComponent;
  let fixture: ComponentFixture<TypeControleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TypeControleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TypeControleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
