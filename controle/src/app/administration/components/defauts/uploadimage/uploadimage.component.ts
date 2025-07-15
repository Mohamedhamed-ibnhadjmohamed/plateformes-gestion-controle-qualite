import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-uploadimage',
  templateUrl: './uploadimage.component.html',
  styleUrls: ['./uploadimage.component.css']
})
export class UploadimageComponent {
  private uploadUrl = 'http://localhost:3000/defaults/upload'; // URL de l'endpoint d'upload
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

      this.uploadImage(formData).subscribe(
        (response) => {
          console.log('Upload successful:', response);
          // Mettez à jour le champ de formulaire "image" avec le chemin de l'image retourné
          this.defaultForm.get('image')?.setValue(response.filename);
        },
        (error) => {
          console.error('Upload failed:', error);
        }
      );
    }
  }

  private uploadImage(formData: FormData): Observable<any> {
    return this.http.post<any>(this.uploadUrl, formData);
  }
}
