import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { PouchdbService } from '../pouchdb.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FeatureModel } from '../model/feature-model';
import { Feature } from '../model/feature';
import { RelationshipType } from '../model/relationships';


@Component({
  selector: 'app-feature-model-detail',
  templateUrl: './feature-model-detail.component.html',
  styleUrls: ['./feature-model-detail.component.css']
})
/**
 * The FeatureModelDetailComponent shows the feature model and allow the adding/updating/deleting of features and dependencies.
 *
 * @author: Author removed due to blind review
 */
export class FeatureModelDetailComponent implements OnInit {

  // Variables for the feature model representation
  featureList: { id: string, levelname: string }[] = [];
  featureModelId: string;
  featureModel: FeatureModel;
  // Variables for the modal representation
  modalFeature: Feature;
  modalReference: NgbModalRef;
  modalSubfeatureIds: string[];
  // References to form groups
  featureModelForm: FormGroup;
  // References for modal children
  @ViewChild('dependencyModal', {static: true}) dependencyModal: any;
  @ViewChild('updateModal', {static: true}) updateModal: any;
  @ViewChild('deleteModal', {static: true}) deleteModal: any;

  /**
   * Creates a new instance of the FeatureModelDetailComponent.
   * @param fb FormBuilder
   * @param route ActivatedRoute
   * @param location Location
   * @param pouchDBServer PouchdbService
   * @param modalService NgbModal
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private location: Location,
    private pouchDBServer: PouchdbService,
    private modalService: NgbModal
  ) {
    // Empty constructor
  }

  /**
   * Initialize the component.
   */
  ngOnInit() {
    // Save feature model id
    this.featureModelId = this.route.snapshot.paramMap.get('id');
    this.loadFeatureModel();
    this.loadForms();
  }

  /**
   * Opens the dependency modal of the current feature.
   * @param featureId id of the current feature
   */
  openDependenciesModal(featureId) {
    this.pouchDBServer.getFeatureModel(this.featureModelId).then(featureModel => {
      this.modalFeature = featureModel.getFeature(featureId);
      this.modalReference = this.modalService.open(this.dependencyModal, {size: 'lg'});
    }, error => {
      console.log('OpenDependencyModal: ' + error);
    });
  }

  /**
   * Opens the update modal of the current feature.
   * @param featureId id of the current feature
   */
  updateFeatureModal(featureId) {
    this.pouchDBServer.getFeatureModel(this.featureModelId).then(featureModel => {
      const feature = featureModel.getFeature(featureId);
      this.modalFeature = feature;
      this.modalSubfeatureIds = feature.getAllSubfeatures().map((f) => f.id);
      this.modalSubfeatureIds.push(feature.id);
      this.modalReference = this.modalService.open(this.updateModal, {size: 'lg'});
    }, error => {
      console.log('UpdateFeatureModal: ' + error);
    });
  }

  /**
   * Opens the modal of the current feature.
   * @param featureId id of the current feature
   */
  deleteFeatureModal(featureId) {
    this.pouchDBServer.getFeatureModel(this.featureModelId).then(featureModel => {
      this.modalFeature = featureModel.getFeature(featureId);
      this.modalReference = this.modalService.open(this.deleteModal, {size: 'lg'});
    }, error => {
      console.log('DeleteFeatureModal: ' + error);
    });
  }

  /**
   * Closes the current modal.
   */
  closeModal() {
    this.modalReference.close();
    this.modalFeature = null;

    // Reload views
    this.loadForms();
    this.loadFeatureModel();
  }

  /**
   * Delete the relationship between two features.
   *
   * @param relationshipType type of the relationship
   * @param fromFeatureId id of the first feature
   * @param toFeatureId id of the second feature
   */
  removeRelationship(relationshipType: RelationshipType, fromFeatureId: string, toFeatureId: string): void {
    this.pouchDBServer.removeRelationship(this.featureModelId, relationshipType, fromFeatureId, toFeatureId).then(() => {
      // Update the modal view
      this.pouchDBServer.getFeatureModel(this.featureModelId).then(featureModel => {
        this.modalFeature = featureModel.getFeature(this.modalFeature.id);
        this.loadFeatureModel();
      }, error => {
        console.log('DeleteDependency (new load): ' + error);
      });
    }, error => {
      console.log('DeleteDependency: ' + error);
    });
  }

  /**
   * Update the current feature.
   */
  updateFeature(featureForm: FormGroup) {
    this.pouchDBServer.updateFeature(
      this.featureModelId,
      this.modalFeature.id,
      featureForm.value,
      featureForm.get('subfeatureOf').value
    ).then(() => {
      this.closeModal();
    }, error => {
      console.log('UpdateFeature: ' + error);
    });
  }

  /**
   * Delete the current feature.
   * @param featureId id of the current feature
   */
  deleteFeature(featureId) {
    this.pouchDBServer.deleteFeature(this.featureModelId, featureId).then(() => {
      this.closeModal();
    }, error => {
      console.log('DeleteFeature: ' + error);
    });
  }

  /**
   * Reload the forms
   */
  private loadForms() {
    this.featureModelForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      version: [''],
      copyright: ['']
    });
  }

  /**
   * Load the current feature model
   */
  private loadFeatureModel() {
    this.pouchDBServer.getFeatureModel(this.featureModelId).then(result => {
      this.featureModel = result;
      this.featureModelForm.patchValue({
        name: this.featureModel.name,
        description: this.featureModel.description,
        version: this.featureModel.version,
        copyright: this.featureModel.copyright
      });
      this.featureList = this.featureModel.getFeatureList();
    }, error => {
      console.log('LoadFeatureModel: ' + error);
    });
  }

  /**
   * Insert a new feature.
   */
  insertFeature(featureForm: FormGroup): void {
    this.pouchDBServer.addFeature(
      this.featureModelId,
      featureForm.value,
      featureForm.get('subfeatureOf').value
    ).then(() => {
      this.loadFeatureModel();
    }, error => {
      console.log('InsertFeature: ' + error);
    });
  }

  /**
   * Add a new relationship.
   */
  addRelationship(relationshipForm: FormGroup): void {
    this.pouchDBServer.addRelationship(
      this.featureModelId,
      relationshipForm.value.relationshipType,
      relationshipForm.value.fromFeatureId,
      relationshipForm.value.toFeatureId
    ).then(() => {
      this.loadFeatureModel();
    }, error => {
      console.log('InsertDependency: ' + error);
    });
  }

  /**
   * Update the author of the feature model
   *
   * @param authorForm the author form with the new values
   */
  updateFeatureModelAuthor(authorForm: FormGroup): void {
    this.pouchDBServer.updateFeatureModelAuthor(this.featureModelId, authorForm.value).then(() => this.loadFeatureModel());
  }

  /**
   * Update the current feature model.
   */
  updateFeatureModel(): void {
    this.pouchDBServer.updateFeatureModel(
      this.featureModel._id,
      this.featureModelForm.value.name,
      this.featureModelForm.value.description,
      this.featureModelForm.value.version,
      this.featureModelForm.value.copyright
    ).then(
      () => this.loadFeatureModel(),
      error => {
        console.log('UpdateFeatureModel: ' + error);
      }
    );
  }

  /**
   * Delete the current feature model.
   */
  deleteFeatureModel(): void {
    this.pouchDBServer.deleteFeatureModel(this.featureModel._id).then(() => {
      // Return back to home page
      this.location.back();
    }, error => {
      console.log('DeleteFeatureModel: ' + error);
    });
  }

}
