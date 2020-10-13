import { AppComponent } from './app.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppComponent', () => {
  let spectator: Spectator<AppComponent>;
  const createComponent = createComponentFactory({
    component: AppComponent,
    imports: [RouterTestingModule],
  });

  beforeEach(() => spectator = createComponent());

  it('should create the app', () => {
    expect(spectator.debugElement.componentInstance).toBeTruthy();
  });
});
