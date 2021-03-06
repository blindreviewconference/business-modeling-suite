import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feature } from '../model/feature';

@Component({
  selector: 'app-feature-form',
  templateUrl: './feature-form.component.html',
  styleUrls: ['./feature-form.component.css']
})
export class FeatureFormComponent implements OnInit, OnChanges {

  @Input() feature: Feature = null;
  @Input() featureList: { id: string, levelname: string }[];
  @Input() disabledSubfeatures: string[] = [];
  @Input() enabledSubfeatures: string[] = null;
  @Input() submitButtonText = 'Update Feature';

  @Output() submitFeatureForm = new EventEmitter<FormGroup>();

  featureForm: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) {
  }

  ngOnInit() {
    if (this.feature === null) {
      this.loadForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.feature) {
      this.loadForm(changes.feature.currentValue);
    }
  }

  submitForm() {
    this.submitFeatureForm.emit(this.featureForm);
    this.loadForm();
  }

  private loadForm(feature: Feature = null) {
    if (feature === null) {
      feature = new Feature(null, new Feature(this.featureList[0].id, null, {}), {name: ''});
    }
    this.featureForm = this.fb.group({
      name: [feature.name, Validators.required],
      description: feature.description,
      type: feature.type,
      subfeatureConnections: feature.subfeatureConnections,
      subfeatureOf: feature.parent ? feature.parent.id : null
    });
    if (Object.keys(feature.expertModelTrace).length > 0) {
      this.featureForm.get('subfeatureOf').disable();
    }
  }

}
