import { Component, Input } from '@angular/core';
import { PRIMENG_IMPORTS } from '../../shared/primeng.imports';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-code-header',
  imports: [PRIMENG_IMPORTS],
  providers: [MessageService],
  templateUrl: './code-header.html',
  styleUrl: './code-header.css'
})
export class CodeHeader {
  @Input() lenguaje: string = '';
  @Input() codeToCopy: string = '';

  constructor(private messageService: MessageService) {}

  copyCode(): void {
    navigator.clipboard.writeText(this.codeToCopy).then(() => {
      this.messageService.add({ 
        severity: 'success', 
        summary: 'Copiado', 
        detail: `¡Código ${this.lenguaje.toUpperCase()} copiado al portapapeles!` 
      });
    });
  }


}
