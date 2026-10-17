import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../../../environments/environment';
import { UploadResponse } from '../../../../models/api';

@Component({
    selector: 'app-uploadimage',
    templateUrl: './uploadimage.component.html',
    styleUrls: ['./uploadimage.component.css'],
    standalone: false
})
export class UploadimageComponent {
  protected readonly destroyRef = inject(DestroyRef);
  private readonly uploadUrl = environment.apiUrl + 'defaults/upload';
  defaultForm: FormGroup;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.defaultForm = this.fb.group({
      image: ['']
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  ajoutImageDefault(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('image', this.selectedFile, this.selectedFile.name);

      this.uploadImage(formData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        (response) => {
          // Mettez à jour le champ de formulaire "image" avec le chemin de l'image retourné
          this.defaultForm.get('image')?.setValue(response.filename);
        },
        (error) => {
          console.error('Upload failed:', error);
        }
      );
    }
  }

  private uploadImage(formData: FormData): Observable<UploadResponse> {
    return this.http.post<UploadResponse>(this.uploadUrl, formData);
  }
}
