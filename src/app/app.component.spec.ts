import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { ListComponent } from './etudiants/list/list.component';
import { FormComponent } from './etudiants/form/form.component';
import { AppRoutingModule } from './app-routing.module';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        ListComponent,
        FormComponent
      ],
      imports: [
        RouterTestingModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have title 'GestionSoutenance-Front'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('GestionSoutenance-Front');
  });
});
