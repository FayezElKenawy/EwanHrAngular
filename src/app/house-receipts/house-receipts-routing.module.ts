import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateCreditNoteComponent } from './components/credit-notes/create-credit-notes/create-credit-note.component';
import { ListCreditNotesComponent } from './components/credit-notes/list-credit-notes/list-credit-notes.component';
import { CoreLayoutComponent } from '@shared/layouts/core-layout/core-layout.component';

const routes: Routes = [
  {
    path: "",
   children: [
    { path: "create-credit-note", component: CreateCreditNoteComponent },
    { path: "credit-notes", component: ListCreditNotesComponent },
   ],
   component:CoreLayoutComponent}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HouseReceiptsRoutingModule { }
