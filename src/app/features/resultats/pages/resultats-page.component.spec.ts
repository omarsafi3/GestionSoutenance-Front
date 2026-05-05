import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { ResultatsService } from '../../../core/services/resultats.service';
import { SoutenancesService } from '../../../core/services/soutenances.service';
import { ResultatsPageComponent } from './resultats-page.component';

describe('ResultatsPageComponent', () => {
  let fixture: ComponentFixture<ResultatsPageComponent>;
  let component: ResultatsPageComponent;
  let resultatsService: jasmine.SpyObj<ResultatsService>;
  let soutenancesService: jasmine.SpyObj<SoutenancesService>;
  let role = 'ADMIN';

  beforeEach(async () => {
    role = 'ADMIN';
    resultatsService = jasmine.createSpyObj<ResultatsService>('ResultatsService', [
      'findAll',
      'findMe',
      'findPublished',
      'validate',
      'publish',
      'calculateBySoutenance'
    ]);
    soutenancesService = jasmine.createSpyObj<SoutenancesService>('SoutenancesService', ['findAll']);
    resultatsService.findAll.and.returnValue(of([]));
    resultatsService.findMe.and.returnValue(of({ id: 1, etudiantId: 1, soutenanceId: 1, publie: true }));
    resultatsService.findPublished.and.returnValue(of([]));
    resultatsService.validate.and.returnValue(of({ id: 1, etudiantId: 1, soutenanceId: 1, valide: true }));
    resultatsService.publish.and.returnValue(of({ id: 1, etudiantId: 1, soutenanceId: 1, valide: true, publie: true }));
    resultatsService.calculateBySoutenance.and.returnValue(of({ id: 2, etudiantId: 1, soutenanceId: 2, valide: false }));
    soutenancesService.findAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ResultatsPageComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getCurrentRole: () => role,
            hasRole: (expected: string) => role === expected
          }
        },
        { provide: ResultatsService, useValue: resultatsService },
        { provide: SoutenancesService, useValue: soutenancesService }
      ]
    }).compileComponents();
  });

  it('loads all results for admins', () => {
    fixture = TestBed.createComponent(ResultatsPageComponent);
    component = fixture.componentInstance;

    component.load();

    expect(resultatsService.findAll).toHaveBeenCalled();
  });

  it('loads only the current published result for students', () => {
    role = 'ETUDIANT';
    fixture = TestBed.createComponent(ResultatsPageComponent);
    component = fixture.componentInstance;

    component.load();

    expect(resultatsService.findMe).toHaveBeenCalled();
    expect(resultatsService.findAll).not.toHaveBeenCalled();
  });

  it('uses admin validate and publish actions', () => {
    role = 'ADMIN';
    fixture = TestBed.createComponent(ResultatsPageComponent);
    component = fixture.componentInstance;

    component.validate({ id: 1, etudiantId: 1, soutenanceId: 1 });
    component.publish({ id: 1, etudiantId: 1, soutenanceId: 1, valide: true });

    expect(resultatsService.validate).toHaveBeenCalledWith(1);
    expect(resultatsService.publish).toHaveBeenCalledWith(1);
  });

  it('calculates selected soutenance results for admins', () => {
    role = 'ADMIN';
    fixture = TestBed.createComponent(ResultatsPageComponent);
    component = fixture.componentInstance;
    component.selectedCalculateSoutenanceId = 2;

    component.calculateSelected();

    expect(resultatsService.calculateBySoutenance).toHaveBeenCalledWith(2);
  });
});
