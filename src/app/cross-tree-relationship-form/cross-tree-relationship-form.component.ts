import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RelationshipType } from '../model/relationships';

@Component({
  selector: 'app-cross-tree-relationship-form',
  templateUrl: './cross-tree-relationship-form.component.html',
  styleUrls: ['./cross-tree-relationship-form.component.css']
})
export class CrossTreeRelationshipFormComponent implements OnInit {

  @Input() featureList: { id: string, levelname: string }[];

  @Output() submitRelationshipForm = new EventEmitter<FormGroup>();

  relationshipForm: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.loadForm();
  }

  private loadForm() {
    this.relationshipForm = this.fb.group({
      relationshipType: RelationshipType.REQUIRES,
      fromFeatureId: [this.featureList[0].id],
      toFeatureId: [this.featureList[1].id]
    });
  }

  submitForm() {
    this.submitRelationshipForm.emit(this.relationshipForm);
    this.loadForm();
  }

}
