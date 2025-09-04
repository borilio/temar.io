import { Component, OnInit } from '@angular/core';
import { PRIMENG_IMPORTS } from '../../shared/primeng.imports';
import { ConfigService } from '../../services/config.service';
import { EnlacesExternos } from '../../models/config.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-enlaces',
  imports: [PRIMENG_IMPORTS, RouterModule],
  templateUrl: './enlaces.html',
  styleUrl: './enlaces.css'
})
export class Enlaces implements OnInit {
  public enlacesExternos: EnlacesExternos;

  constructor(private configService: ConfigService) {
    this.enlacesExternos = configService.getEnlacesExternos();
  }

  ngOnInit(): void {}

}
