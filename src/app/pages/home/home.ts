import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import Swiper from 'swiper';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import { CategoriesService } from '../../services/categories.service';
import { Category } from '../../interfaces/category.interface';
import { ProfessionalsService, Professional } from '../../services/professionals.service';

Swiper.use([Pagination, Autoplay, Navigation]);
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, AfterViewInit {
  currentDate: string = '';
  categories: Category[] = [];
  isLoading = true;
  swiperInstance: Swiper | null = null;
    professionals: Professional[] = [];

constructor(
  public router: Router,
  public categoriesService: CategoriesService,
  private ngZone: NgZone,
  public professionalsService: ProfessionalsService

) { 
  
}
  ngOnInit() {
     this.updateDate();
    this.loadCategories();
    this.loadProfessionals();

  }
loadProfessionals() {
    this.isLoading = true;
    this.professionalsService.professionals$.subscribe({
      next: (pros) => {
        console.log('Professionals loaded:', pros);
        this.professionals = pros;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading professionals:', error);
        this.isLoading = false;
      }
    });
  }
  goToProfile(id: string) {
    console.log('Navegando al perfil profesional:', id);
    this.router.navigate(['/detail-profesional', id]);
  }
  private updateDate() {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    this.currentDate = new Date().toLocaleDateString('es-ES', options);
  }
  ngAfterViewInit(): void {
    // 🔹 Slider principal
    new Swiper('.doctor-appointment-slider', {
      slidesPerView: 1,
      loop: true,
      autoplay: { delay: 4000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      speed: 600
    });

    // 🔹 Slider de especialidades
    new Swiper('.doctor-speciality-slider', {
      slidesPerView: 1.3,
      spaceBetween: 10,
      freeMode: true,
      breakpoints: {
        480: { slidesPerView: 2.5 },
        768: { slidesPerView: 3.5 }
      }
    });
  }
  /** 🔹 Cargar categorías desde PocketBase */
  loadCategories() {
    this.categoriesService.listTop(10).subscribe({
      next: (cats) => {
        this.categories = cats;
        this.isLoading = false;

        // Swiper debe inicializarse luego de renderizar el DOM
        setTimeout(() => this.initSwiper(), 100);
      },
      error: (err) => {
        console.error('Error cargando categorías:', err);
        this.isLoading = false;
      },
    });
  }

  /** 🔹 Inicializa el carrusel Swiper */
  initSwiper() {
    // Evitar duplicar instancias
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
    }

    this.ngZone.runOutsideAngular(() => {
      this.swiperInstance = new Swiper('.doctor-speciality-slider', {
        modules: [Navigation, Autoplay],
        slidesPerView: 2.3,
        spaceBetween: 12,
        loop: true,
        autoplay: {
          delay: 2500,
          disableOnInteraction: false,
        },
        breakpoints: {
          768: { slidesPerView: 3.3 },
          1024: { slidesPerView: 4.3 },
        },
      });
    });
  }

  /** 🔹 Devuelve ícono predeterminado si no hay imagen */
  getCategoryIcon(cat: Category): string {
    const map: any = {
      'odontología': 'ph-tooth',
      'cardiología': 'ph-heart',
      'psicología': 'ph-brain',
      'fisioterapia': 'ph-person-simple-run',
      'oftalmología': 'ph-eye',
    };
    return map[cat.name.toLowerCase()] || 'ph-first-aid';
  }

}
