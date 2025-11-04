import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Professional, ProfessionalsService } from '../../services/professionals.service';

@Component({
  selector: 'app-detail-profesional',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detail-profesional.html',
  styleUrl: './detail-profesional.scss',
})
export class DetailProfesional implements OnInit {
  profesionalId: string = '';
  pro: Professional | null = null;
  isLoading: boolean = true;
  profesional: Professional | null = null;
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public professionalsService: ProfessionalsService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.profesionalId = params['id'];
      console.log('ID del profesional:', this.profesionalId);
      this.loadProfessional();
    });
  }
   loadProfessional() {
    if (!this.profesionalId) return;

    this.isLoading = true;
    this.professionalsService.professionals$.subscribe({
      next: (professionals) => {
        this.pro = professionals.find(p => p.id === this.profesionalId) || null;
        console.log('Profesional cargado:', this.pro);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el profesional:', error);
        this.isLoading = false;
      }
    });
  }
}
