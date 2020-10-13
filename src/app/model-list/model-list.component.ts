import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FeatureModel } from '../model/feature-model';

@Component({
  selector: 'app-model-list',
  templateUrl: './model-list.component.html',
  styleUrls: ['./model-list.component.css']
})
export class ModelListComponent {

  @Input() modelListTitle: string;
  @Input() modelList: FeatureModel[];
  @Input() modelFormTitle: string;

  @Output() viewModel = new EventEmitter<string>();
  @Output() editModel = new EventEmitter<string>();
  @Output() deleteModel = new EventEmitter<string>();
  @Output() addModel = new EventEmitter<{ name: string, description: string }>();

  modelForm = this.fb.group({name: ['', Validators.required], description: []});

  constructor(
    private fb: FormBuilder,
  ) {
  }

  addModelForwardEmitter() {
    this.addModel.emit({
      name: this.modelForm.value.name,
      description: this.modelForm.value.description
    });
  }

}
