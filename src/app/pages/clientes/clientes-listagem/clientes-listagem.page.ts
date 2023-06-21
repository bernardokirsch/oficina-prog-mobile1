import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Cliente } from 'src/app/models/cliente.model';
import { ClientesService } from 'src/app/services/clientes.service';

@Component({
  selector: 'app-clientes-listagem',
  templateUrl: './clientes-listagem.page.html',
  styleUrls: ['./clientes-listagem.page.scss'],
})
export class ClientesListagemPage implements OnInit {
  public clientes: Cliente[] | undefined;

  constructor(private clientesService: ClientesService) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.clientes = await this.clientesService.getAll();
  }

}
