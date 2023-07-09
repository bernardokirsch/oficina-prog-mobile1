import { Injectable } from "@angular/core";
import { collection, doc, Firestore, getDoc, getDocs, orderBy, query, setDoc, deleteDoc } from "@angular/fire/firestore";
import { OrdemDeServico, ordemDeServicoConverter } from "../models/ordemdeservico.model";
import { DatabaseService } from "./database.services";
import { databaseName } from "./database.statements";
import { Guid } from "guid-typescript";


@Injectable({
    providedIn: 'root'
})

export class OrdensDeServicoService {
    osForm: any;
    alertService: any;
    loadingCtrl: any;
    ordensDeServicoService: any;
    toastService: any;
    router: any;

    constructor(
        private databaseService: DatabaseService,
        private _fireStore: Firestore,
    ) { }

    public async getAll(): Promise<OrdemDeServico[]> {
        const ordensDeServico: OrdemDeServico[] = [];
        const q = query(collection(this._fireStore, "ordensdeservico"), orderBy("dataehoraentrada", "desc")).withConverter(ordemDeServicoConverter);
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            ordensDeServico.push(doc.data());
        });
        return ordensDeServico;
    }

    public async getById(clienteId: string): Promise<OrdemDeServico> {
        const q = doc(this._fireStore, "ordensdeservico", clienteId).withConverter(ordemDeServicoConverter);
        const querySnapshot = await getDoc(q);
        const data = querySnapshot.data();
        if (querySnapshot.exists() && data) {
            return data;
        } else {
            throw new Error('Ordem de Serviço com ID ${clienteId} não encontrada.');
        }
    }

    async update(ordemDeServico: OrdemDeServico) {
        ordemDeServico.dataehoraentrada = new Date(ordemDeServico.dataehoraentrada);
        const clientesRef = collection(this._fireStore, "ordensdeservico");
        if (ordemDeServico.ordemdeservicoid.length == 0) {
            await setDoc(doc(clientesRef).withConverter(ordemDeServicoConverter), ordemDeServico);
        } else {
            await setDoc(doc(this._fireStore, "ordensdeservico", ordemDeServico.ordemdeservicoid).withConverter(ordemDeServicoConverter), ordemDeServico);
        }
    }

    async removeById(ordensDeServicoId: string) {
        await deleteDoc(doc(this._fireStore, "ordensdeservico", ordensDeServicoId));
    }

    async submit() {
        if (this.osForm.invalid || this.osForm.pending) {
            await this.alertService.presentAlert('Falha', 'Gravação não foi executada', 'Verifique os dados informados para o atendimento', ['Ok']);
            return;
        }
        const loading = await this.loadingCtrl.create();
        await loading.present();
        const data = new Date(this.osForm.constrols['dataentrada'].value).toISOString();
        // const hora = new Date(this.osForm.constrols['horaentrada'].value).toISOString();
        this.osForm.controls['dataehoraentrada'].setValue(
            data.substring(0, 11) + this.osForm.controls['horaentrada'].value);
        await this.ordensDeServicoService.update(this.osForm.value);
        loading.dismiss().then(() => {
            this.toastService.presentToast('Gravação bem sucedida', 3000, 'top');
            this.router.navigateByUrl('ordensdeservico-listagem');
        })
    }
}