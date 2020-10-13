import { BusinessModelViewComponent } from './business-model-view.component';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { ReactiveFormsModule } from '@angular/forms';
import { MockComponent } from 'ng-mocks';
import { CanvasBuildingBlockComponent } from '../canvas-building-block/canvas-building-block.component';
import { RouterTestingModule } from '@angular/router/testing';
import { PouchdbService } from '../pouchdb.service';

describe('BusinessModelViewComponent', () => {
  let spectator: Spectator<BusinessModelViewComponent>;
  const createComponent = createComponentFactory({
    component: BusinessModelViewComponent,
    declarations: [
      MockComponent(CanvasBuildingBlockComponent),
    ],
    imports: [ReactiveFormsModule, RouterTestingModule],
    providers: [
      mockProvider(PouchdbService, {
        getFeatureModel: () => new Promise(() => {
        }),
      })
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
