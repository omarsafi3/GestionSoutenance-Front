import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthSession, UserRole } from './core/auth/auth.models';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'GestionSoutenance-Front';
  navOpen = false;
  modulesOpen = false;

  readonly session$ = this.authService.session$;
  private observer: IntersectionObserver | null = null;
  private readonly routerSubscription: Subscription;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly ngZone: NgZone
  ) {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.navOpen = false;
        this.modulesOpen = false;
        window.setTimeout(() => this.setupScrollReveal(), 0);
      });
  }

  ngAfterViewInit(): void {
    this.setupScrollReveal();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.routerSubscription.unsubscribe();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  canAccess(roles: readonly UserRole[]): boolean {
    return this.authService.hasAnyRole(roles);
  }

  logout(): void {
    this.authService.logout();
    this.navOpen = false;
    this.modulesOpen = false;
    this.router.navigate(['/login']);
  }

  homeLink(session: AuthSession | null): string[] {
    if (!session) {
      return ['/login'];
    }

    return ['/'];
  }

  toggleNav(): void {
    this.navOpen = !this.navOpen;
  }

  toggleModules(event: MouseEvent): void {
    event.preventDefault();
    this.modulesOpen = !this.modulesOpen;
  }

  private setupScrollReveal(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.revealElements().forEach(element => {
        element.classList.add('is-visible');
      });
      return;
    }

    this.observer?.disconnect();
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          this.observer?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    this.ngZone.runOutsideAngular(() => {
      this.revealElements().forEach((element, index) => {
        element.classList.add('reveal-ready');
        element.style.setProperty('--reveal-delay', `${Math.min(index * 55, 260)}ms`);
        this.observer?.observe(element);
      });
    });
  }

  private revealElements(): HTMLElement[] {
    return Array.from(this.elementRef.nativeElement.querySelectorAll<HTMLElement>(
      '[data-reveal], .page-header, .panel, .summary-tile, .result-card, .detail-block'
    ));
  }
}
