import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  Award,
  ArrowLeft,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CircleAlert,
  CircleCheck,
  CirclePlus,
  ClipboardList,
  ExternalLink,
  Eye,
  FileText,
  GraduationCap,
  Home,
  IdCard,
  Inbox,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Pencil,
  RotateCw,
  School,
  Send,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  UserCircle,
  UserRoundCog,
  Users,
  X,
  LucideAngularModule
} from 'lucide-angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ListComponent } from './etudiants/list/list.component';
import { FormComponent } from './etudiants/form/form.component';
import { DetailComponent } from './etudiants/detail/detail.component';
import { EncadrantsListComponent } from './encadrants/list/list.component';
import { EncadrantsFormComponent } from './encadrants/form/form.component';
import { EncadrantsDetailComponent } from './encadrants/detail/detail.component';
import { JwtInterceptor } from './core/auth/interceptors/jwt.interceptor';
import { EnseignantListComponent } from './features/enseignant/enseignant-list/enseignant-list.component';
import { EnseignantFormComponent } from './features/enseignant/enseignant-form/enseignant-form.component';
import { SalleListComponent } from './features/salles/salle-list/salle-list.component';
import { SalleFormComponent } from './features/salles/salle-form/salle-form.component';
import { SoutenanceListComponent } from './features/soutenances/soutenance-list/soutenance-list.component';
import { SoutenanceFormComponent } from './features/soutenances/soutenance-form/soutenance-form.component';
import { ChatbotAssistantComponent } from './core/chatbot/chatbot-assistant.component';
@NgModule({
  declarations: [
    AppComponent,
    ListComponent,
    FormComponent,
    DetailComponent,
    EncadrantsListComponent,
    EncadrantsFormComponent,
    EncadrantsDetailComponent,
    EnseignantListComponent,
    EnseignantFormComponent,
    SalleListComponent,
    SalleFormComponent,
    SoutenanceListComponent,
    SoutenanceFormComponent,
    ChatbotAssistantComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule.pick({
      Award,
      ArrowLeft,
      Bot,
      BriefcaseBusiness,
      Building2,
      CalendarDays,
      CircleAlert,
      CircleCheck,
      CirclePlus,
      ClipboardList,
      ExternalLink,
      Eye,
      FileText,
      GraduationCap,
      Home,
      IdCard,
      Inbox,
      LayoutDashboard,
      LogIn,
      LogOut,
      Menu,
      Pencil,
      RotateCw,
      School,
      Send,
      ShieldCheck,
      Trash2,
      TriangleAlert,
      UserCircle,
      UserRoundCog,
      Users,
      X
    }),
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
