import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { EncadrantsService } from '../../../core/services/encadrants.service';
import { NotesService } from '../../../core/services/notes.service';
import { SoutenancesService } from '../../../core/services/soutenances.service';
import { NotesPageComponent } from './notes-page.component';

describe('NotesPageComponent', () => {
  let fixture: ComponentFixture<NotesPageComponent>;
  let component: NotesPageComponent;
  let notesService: jasmine.SpyObj<NotesService>;

  beforeEach(async () => {
    notesService = jasmine.createSpyObj<NotesService>('NotesService', ['findBySoutenance', 'create', 'update']);

    await TestBed.configureTestingModule({
      imports: [NotesPageComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            hasRole: (role: string) => role === 'ENSEIGNANT',
            getCurrentEnseignantId: () => 1
          }
        },
        {
          provide: SoutenancesService,
          useValue: {
            findAll: () => of([
              { id: 10, titre: 'SOA', presidentId: 1, rapporteurId: 2, examinateurId: 3 },
              { id: 11, titre: 'Cloud', presidentId: 2, rapporteurId: 1, examinateurId: 3 }
            ])
          }
        },
        { provide: EncadrantsService, useValue: { findAll: () => of([]) } },
        { provide: NotesService, useValue: notesService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('locks teacher evaluator and derives jury role from selected soutenance', () => {
    component.form.soutenanceId = 11;

    component.onSoutenanceChange();

    expect(component.form.evaluateurId).toBe(1);
    expect(component.form.roleJury).toBe('RAPPORTEUR');
  });

  it('filters visible notes to the current teacher', () => {
    notesService.findBySoutenance.and.returnValue(of([
      { id: 1, soutenanceId: 10, evaluateurId: 1, roleJury: 'PRESIDENT', noteExpose: 12, noteRapport: 13, noteQuestions: 14 },
      { id: 2, soutenanceId: 10, evaluateurId: 2, roleJury: 'RAPPORTEUR', noteExpose: 10, noteRapport: 11, noteQuestions: 12 }
    ]));
    component.selectedSoutenanceId = 10;

    component.loadBySoutenance();

    expect(component.notes.length).toBe(1);
    expect(component.notes[0].evaluateurId).toBe(1);
  });
});
