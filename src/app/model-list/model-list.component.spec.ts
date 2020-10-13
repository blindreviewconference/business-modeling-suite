import { ModelListComponent } from './model-list.component';
import { byText, createComponentFactory, Spectator } from '@ngneat/spectator';
import { ReactiveFormsModule } from '@angular/forms';

describe('ModelListComponent', () => {
  let spectator: Spectator<ModelListComponent>;
  const createComponent = createComponentFactory({
    component: ModelListComponent,
    imports: [ReactiveFormsModule],
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should add model', () => {
    spyOn(spectator.component.addModel, 'emit');
    spectator.setInput('modelFormTitle', 'Form Title');
    spectator.typeInElement('Test Model', '#name');
    spectator.typeInElement('Test Description', '#description');
    spectator.click(byText('Form Title', {selector: 'button'}));
    expect(spectator.component.addModel.emit).toHaveBeenCalledWith({
      name: 'Test Model',
      description: 'Test Description',
    });
  });
});
