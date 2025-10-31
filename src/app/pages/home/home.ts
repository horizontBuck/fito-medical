import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import Swiper from 'swiper';
import { Pagination, Autoplay } from 'swiper/modules';

Swiper.use([Pagination, Autoplay]);
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, AfterViewInit {
  currentDate: string = '';
constructor(
  public router: Router
) { }
  ngOnInit() {
    this.updateDate();
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
}
