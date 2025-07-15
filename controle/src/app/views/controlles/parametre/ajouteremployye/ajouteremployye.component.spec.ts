import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouteremployyeComponent } from './ajouteremployye.component';

describe('AjouteremployyeComponent', () => {
  let component: AjouteremployyeComponent;
  let fixture: ComponentFixture<AjouteremployyeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AjouteremployyeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AjouteremployyeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
