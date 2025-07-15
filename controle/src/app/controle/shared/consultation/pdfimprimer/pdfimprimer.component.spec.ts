import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfimprimerComponent } from './pdfimprimer.component';

describe('PdfimprimerComponent', () => {
  let component: PdfimprimerComponent;
  let fixture: ComponentFixture<PdfimprimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PdfimprimerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PdfimprimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
