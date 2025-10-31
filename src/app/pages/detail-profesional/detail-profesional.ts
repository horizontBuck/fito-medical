import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-detail-profesional',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detail-profesional.html',
  styleUrl: './detail-profesional.scss',
})
export class DetailProfesional {

  constructor(
    public router: Router
  ) { }
}
