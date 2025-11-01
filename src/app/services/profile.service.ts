import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { PbService } from "./pb.service";

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private userProfile = new BehaviorSubject<any>(null);
  userProfile$ = this.userProfile.asObservable();

  constructor(private pb: PbService) {}

  loadUserProfile(userId: string) {
    // Cargar datos del usuario desde PocketBase
    this.pb.getUserExpanded(userId).then(profile => {
      this.userProfile.next(profile);
    });
  }
}