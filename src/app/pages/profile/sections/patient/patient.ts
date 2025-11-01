import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './patient.html',
  styleUrl: './patient.scss',
})
export class Patient {

}
