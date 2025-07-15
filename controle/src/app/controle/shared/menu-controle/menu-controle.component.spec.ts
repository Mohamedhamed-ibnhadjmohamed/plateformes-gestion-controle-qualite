import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuControleComponent } from './menu-controle.component';

describe('MenuControleComponent', () => {
  let component: MenuControleComponent;
  let fixture: ComponentFixture<MenuControleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuControleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenuControleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
