import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FeatureModel } from '../model/feature-model';
import { PouchdbService } from '../pouchdb.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Feature } from '../model/feature';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RelationshipType } from '../model/relationships';

@Component({
  selector: 'app-merge-model-view',
  templateUrl: './merge-model-view.component.html',
  styleUrls: ['./merge-model-view.component.css']
})
export class MergeModelViewComponent implements OnInit, OnDestroy {

  @ViewChild('dependencyModal', {static: true}) dependencyModal: any;
  @ViewChild('mergeModal', {static: true}) mergeModal: any;
  @ViewChild('updateModal', {static: true}) updateModal: any;
  @ViewChild('traceModal', {static: true}) traceModal: any;
  @ViewChild('selectModal', {static: true}) selectModal: any;
  @ViewChild('deleteModal', {static: true}) deleteModal: any;

  expertModel: FeatureModel;
  companyModel: FeatureModel;

  companyFeatureList: { id: string, levelname: string }[] = [];

  companyModelId: string;
  expertModelId: string;

  paramSubscription: Subscription;

  modalFeatureModel: FeatureModel;
  modalFeature: Feature;
  modalTracedFeature: Feature;
  modalReference: NgbModalRef;
  modalSubfeatureIds: string[];
  modalSelectFeatureForm: FormGroup;

  companyOpenPanels: string[] = null;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private pouchdbService: PouchdbService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.paramSubscription = this.route.paramMap.subscribe((params) => {
      this.companyModelId = params.get('companyModelId');
      this.expertModelId = params.get('expertModelId');
      this.loadModels();
    });
  }

  ngOnDestroy() {
    if (this.paramSubscription !== null) {
      this.paramSubscription.unsubscribe();
    }
  }

  loadModels() {
    this.loadExpertModel();
    this.loadCompanyModel();
  }

  loadExpertModel() {
    this.pouchdbService.getFeatureModel(this.expertModelId).then((expertModel) => this.expertModel = expertModel);
  }

  loadCompanyModel() {
    this.pouchdbService.getFeatureModel(this.companyModelId).then((companyModel) => {
      if (this.companyOpenPanels === null) {
        this.companyOpenPanels = Object.values(companyModel.features).reduce((acc, feature) => {
          acc.push(feature.id.toString());
          acc.push(...feature.getAllSubfeatures().filter((f) => Object.values(f.subfeatures).length > 0).map((f) => f.id.toString()));
          return acc;
        }, []);
      }
      this.companyModel = companyModel;
      this.companyFeatureList = companyModel.getFeatureList();
    });
  }

  openDependenciesModalExpertModel(featureId: string) {
    this.openDependenciesModal(this.expertModel, featureId);
  }

  openDependenciesModalCompanyModel(featureId: string) {
    this.openDependenciesModal(this.companyModel, featureId);
  }

  openDependenciesModal(featureModel: FeatureModel, featureId: string) {
    this.pouchdbService.getFeatureModel(featureModel._id).then(fM => {
      const feature = fM.getFeature(featureId);
      this.modalFeatureModel = fM;
      this.modalFeature = feature;
      this.modalReference = this.modalService.open(this.dependencyModal, {size: 'lg'});
    }, error => {
      console.log('OpenDependencyModal: ' + error);
    });
  }

  openTraceModal(featureId) {
    this.modalFeatureModel = this.companyModel;
    this.modalFeature = this.companyModel.getFeature(featureId);
    this.modalTracedFeature = this.expertModel.getFeature(this.modalFeature.expertModelTrace[this.expertModelId]);
    this.modalReference = this.modalService.open(this.traceModal, {size: 'lg'});
  }

  openExpertTraceModal(featureId) {
    this.modalFeatureModel = this.expertModel;
    this.modalFeature = this.expertModel.getFeature(featureId);
    this.modalTracedFeature = this.companyModel.getFeature(
      this.companyModel.expertModelTraces[this.expertModelId].expertFeatureIdMap[featureId]
    );
    this.modalReference = this.modalService.open(this.traceModal, {size: 'lg'});
  }

  openMergeModal(featureId: string) {
    this.pouchdbService.getFeatureModel(this.expertModelId).then(featureModel => {
      const expertFeature = featureModel.getFeature(featureId);
      const parentId = this.companyModel.expertModelTraces[this.expertModelId].expertFeatureIdMap[expertFeature.parent.id];
      this.modalSubfeatureIds = this.companyModel.getFeature(parentId).getAllSubfeatures().map((feature) => feature.id);
      this.modalSubfeatureIds.push(parentId);
      const companyModelFeatureParentId = this.companyModel
        .expertModelTraces[this.expertModelId].expertFeatureIdMap[expertFeature.parent.id];
      this.modalFeature = new Feature(expertFeature.id, new Feature(companyModelFeatureParentId, null, {}), expertFeature);
      this.modalReference = this.modalService.open(this.mergeModal, {size: 'lg'});
    }, error => {
      console.log('UpdateFeatureModal: ' + error);
    });
  }

  openSelectModal(featureId: string) {
    this.modalFeature = this.expertModel.getFeature(featureId);
    this.modalSubfeatureIds = this.companyModel.getFeature(
      this.companyModel.expertModelTraces[this.expertModelId].expertFeatureIdMap[this.modalFeature.parent.id]
    ).getAllSubfeatures().map((feature) => feature.id);
    const selectedIds = Object.values(this.companyModel.expertModelTraces[this.expertModelId].expertFeatureIdMap);
    this.modalSubfeatureIds = this.modalSubfeatureIds.filter((id) => !selectedIds.includes(id));
    this.modalSelectFeatureForm = this.fb.group({
      feature: null,
    });
    this.modalReference = this.modalService.open(this.selectModal, {size: 'lg'});
  }

  openDeleteFeatureModal(featureId: string) {
    this.modalFeature = this.companyModel.getFeature(featureId);
    this.modalReference = this.modalService.open(this.deleteModal, {size: 'lg'});
  }

  openUpdateFeatureModal(featureId: string) {
    this.pouchdbService.getFeatureModel(this.companyModelId).then(featureModel => {
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
   * Closes the current modal.
   */
  closeModal() {
    this.modalReference.close();
    this.modalFeature = null;
    this.loadModels();
  }

  mergeFeature(featureForm: FormGroup) {
    this.pouchdbService.addFeatureMerge(
      this.companyModelId,
      featureForm.value,
      featureForm.get('subfeatureOf').value,
      this.expertModelId,
      this.modalFeature.id,
    ).then(() => {
      this.closeModal();
    }, error => {
      console.log('MergeFeature: ' + error);
    });
  }

  mergeIntoSelected() {
    this.pouchdbService.addTrace(
      this.companyModelId, this.modalSelectFeatureForm.value.feature, this.expertModelId, this.modalFeature.id
    ).then(() => {
      this.closeModal();
    });
  }

  deleteTrace() {
    if (this.modalFeatureModel === this.companyModel) {
      this.deleteCompanyTrace();
    } else {
      this.deleteExpertTrace();
    }
  }

  deleteCompanyTrace() {
    this.pouchdbService.deleteTrace(
      this.companyModelId, this.modalFeature.id, this.expertModelId,
    ).then(() => {
      this.closeModal();
    });
  }

  deleteExpertTrace() {
    this.pouchdbService.deleteTrace(
      this.companyModelId, this.modalTracedFeature.id, this.expertModelId,
    ).then(() => {
      this.closeModal();
    });
  }

  deleteFeature(featureId) {
    this.pouchdbService.deleteFeature(this.companyModelId, featureId).then(() => {
      this.closeModal();
    }, error => {
      console.log('DeleteFeature: ' + error);
    });
  }

  addDependency(relationshipType: RelationshipType, fromFeatureId: string, toFeatureId: string) {
    this.pouchdbService.addRelationship(this.companyModelId, relationshipType, fromFeatureId, toFeatureId).then(() => {
      this.closeModal();
    }, error => {
      console.log('AddDependency: ' + error);
    });
  }

  deleteDependency(relationshipType: RelationshipType, fromId: string, toId: string) {
    this.pouchdbService.removeRelationship(this.companyModelId, relationshipType, fromId, toId).then(() => {
      this.loadModels();
      this.pouchdbService.getFeatureModel(this.companyModelId).then(
        (featureModel) => this.modalFeature = featureModel.getFeature(this.modalFeature.id),
        (error) => console.log('DeleteDependency: ' + error),
      );
    }, error => {
      console.log('DeleteDependency: ' + error);
    });
  }

  addFeatureToCompanyModel(featureForm: FormGroup) {
    this.pouchdbService.addFeature(
      this.companyModelId,
      featureForm.value,
      featureForm.get('subfeatureOf').value
    ).then(() => {
      this.loadModels();
    }, error => {
      console.log('AddFeatureToCompanyModel: ' + error);
    });
  }

  updateFeature(featureForm: FormGroup) {
    this.pouchdbService.updateFeature(
      this.companyModelId,
      this.modalFeature.id,
      featureForm.value,
      featureForm.get('subfeatureOf').value
    ).then(() => {
      this.closeModal();
    }, error => {
      console.log('UpdateFeature: ' + error);
    });
  }

  asKeys(map: { [id: string]: Feature }): string[] {
    return Object.keys(map);
  }
}
