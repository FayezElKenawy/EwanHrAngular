import { Component, OnInit } from '@angular/core';
import { AuthService } from '@shared/services/auth.service';
import { IServiceResult } from '@shared/interfaces/results';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  authUserVM: any;

  constructor(private _route: ActivatedRoute) {}

  ngOnInit() {
    this.authUserVM = this._route.snapshot.data['authUserVM'];
  }
}
