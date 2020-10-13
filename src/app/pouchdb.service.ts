import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import { FeatureModel } from './model/feature-model';
import { Feature, FeatureType, SubfeatureConnectionsType } from './model/feature';
import { Instance } from './model/instance';
import { RelationshipType } from './model/relationships';
import examples from '../assets/examples.json';
import { Author } from './model/author';

@Injectable({
  providedIn: 'root'
})
/**
 * The PouchdbService handles the complete interaction of the web application with the PouchDB or CouchDB.
 * The specific database can be set in the constructor of the class
 *
 * @author Author removed due to blind review
 */
export class PouchdbService {
  db: PouchDB.Database<FeatureModel>;

  // Use "http://localhost:4200/database" for connecting to a CouchDB specified in the proxy.conf.json
  databaseName = 'business-modeling-suite';

  /**
   * Create a new instance of the PouchdbService.
   */
  constructor() {

    // Create a PouchDB connection
    PouchDB.plugin(PouchDBFind);
    // Change to this.db = new PouchDB('http://server:port/yourdatabase'); to connect to a couchdb database
    this.db = new PouchDB(this.databaseName);

    // Check database connection
    this.db.info().then((info) => console.log('Database connection: ' + JSON.stringify(info)));
  }

  getDatabaseInfo() {
    return this.db.info();
  }

  /**
   * Get the list of the expert models.
   */
  getExpertModelList() {
    return this.db.find({
      selector: {
        expertModel: true,
      },
      fields: ['_id', 'name', 'description', 'author', 'version', 'copyright']
    });
  }

  /**
   * Get the list of the company models.
   */
  getCompanyModelList() {
    return this.db.find({
      selector: {
        expertModel: false,
      },
      fields: ['_id', 'name', 'description', 'author', 'version', 'copyright']
    });
  }

  /**
   * Get the list of the feature models.
   */
  getFeatureModelList() {
    return this.db.find({
      selector: {},
      fields: ['_id', 'name', 'description']
    });
  }

  /**
   * Get the current feature model.
   * @param featureModelId id of the current feature model
   */
  getFeatureModel(featureModelId: string) {
    return this.db.get(featureModelId).then((f) => new FeatureModel(f));
  }

  /**
   * Add a new feature model.
   * @param name name of the feature model
   * @param description description of the feature model
   * @param expertModel whether the model is an expert model (value: true) or a company model (value: false)
   */
  addFeatureModel(name: string, description: string, expertModel = false) {
    return this.db.post(new FeatureModel({
      name,
      description,
      expertModel
    }).toPouchDb());
  }

  /**
   * Remove the current feature model.
   * @param id id of the current feature model
   */
  deleteFeatureModel(id: string) {
    return this.db.get(id).then(result => {
      return this.db.remove(result);
    });
  }

  /**
   * Update name and description of the current feature model.
   * @param id id of the current feature model
   * @param name name of the current feature model
   * @param description description of the current feature model
   * @param version version of the current feature model
   * @param copyright copyright of the current feature model
   */
  updateFeatureModel(id: string, name: string, description: string, version: string, copyright: string) {
    return this.getFeatureModel(id).then(result => {
      result.name = name;
      result.description = description;
      result.version = version;
      result.copyright = copyright;
      return this.saveFeatureModel(result);
    });
  }

  /**
   * Update the author of a feature model.
   *
   * @param featureModelId the id of the feature model
   * @param author the new values of the author (values will be copied to the current object)
   */
  updateFeatureModelAuthor(featureModelId: string, author: Partial<Author>) {
    return this.getFeatureModel(featureModelId).then((featureModel) => {
      featureModel.updateAuthor(author);
      return this.saveFeatureModel(featureModel);
    });
  }

  /**
   * Add a business model decision to the business model.
   * @param featureModelId id of the current feature model
   * @param featureId id of the feature to add
   * @param instanceId the id of the instance
   */
  addBusinessDecision(featureModelId: string, featureId: string, instanceId: number) {
    return this.getFeatureModel(featureModelId).then(featureModel => {
      featureModel.addFeatureToInstance(instanceId, featureId);
      return this.saveFeatureModel(featureModel);
    });
  }

  /**
   * Remove a business model decision from the business model.
   * @param featureModelId id of the current feature model
   * @param featureId id of the feature to remove
   * @param instanceId the id of the instance
   */
  removeBusinessDecision(featureModelId: string, featureId: string, instanceId: number) {
    return this.getFeatureModel(featureModelId).then(featureModel => {
      featureModel.removeFeatureFromInstance(instanceId, featureId);
      return this.saveFeatureModel(featureModel);
    });
  }

  /**
   * Add an expert model to the selected expert model list of a company model
   *
   * @param companyModelId the id of the company model to which the expert model should be added
   * @param expertModelId the id of the expert model that should be added to the company model
   */
  selectExpertModel(companyModelId: string, expertModelId: string) {
    return this.getFeatureModel(companyModelId).then(companyModel => {
      companyModel.addExpertModel(expertModelId);
      return this.saveFeatureModel(companyModel);
    });
  }

  /**
   * Get the selected expert models of a company model
   *
   * @param companyModelId the id of the company model
   */
  getSelectedExpertModels(companyModelId: string) {
    return this.db.get(companyModelId).then(companyModel => {
      return this.db.find({
        selector: {
          _id: {$in: Object.keys(companyModel.expertModelTraces)}
        },
        fields: ['_id', 'name']
      });
    });
  }

  /**
   * Get the unselected expert models of a company model
   *
   * @param companyModelId the id of the company model
   */
  getUnselectedExpertModels(companyModelId: string) {
    return this.db.get(companyModelId).then(companyModel => {
      return this.db.find({
        selector: {
          $not: {
            _id: {$in: Object.keys(companyModel.expertModelTraces)}
          },
          expertModel: true,
        },
        fields: ['_id', 'name']
      });
    });
  }

  /**
   * Remove an expert model from the selected expert model list of a company model
   *
   * @param companyModelId the id of the company model from which the expert model should be removed
   * @param expertModelId the id of the expert model that should be removed from the company model
   */
  unselectExpertModel(companyModelId: string, expertModelId: string) {
    return this.getFeatureModel(companyModelId).then(companyModel => {
      companyModel.removeExpertModel(expertModelId);
      return this.saveFeatureModel(companyModel);
    });
  }

  /**
   * Add a new instance to the feature model
   *
   * @param featureModelId the id of the feature model
   * @param instance the instance to add (values will be copied to a new object)
   */
  addInstance(featureModelId: string, instance: Partial<Instance>) {
    return this.getFeatureModel(featureModelId).then(featureModel => {
      featureModel.addInstance(instance);
      return this.saveFeatureModel(featureModel);
    });
  }

  /**
   * Update the name of the business model.
   * @param featureModelId id of the current feature model
   * @param instanceId the id of the instance
   * @param name new name of the business model
   * @param description new description of the business model
   */
  updateBusinessModel(featureModelId: string, instanceId: number, name: string, description: string) {
    return this.getFeatureModel(featureModelId).then(featureModel => {
      featureModel.updateInstance(instanceId, {name, description});
      return this.saveFeatureModel(featureModel);
    });
  }

  /**
   * Adapt an existing business model.
   * @param featureModelId id of the current feature model
   * @param instanceId the id of the instance
   * @param adaptationName name of the adapted business model
   */
  adaptBusinessModel(featureModelId: string, instanceId: number, adaptationName: string) {
    return this.getFeatureModel(featureModelId).then(featureModel => {
      featureModel.adaptInstance(instanceId, adaptationName);
      return this.saveFeatureModel(featureModel);
    });
  }

  /**
   * Delete a specific business model of the current feature model.
   * @param featureModelId id of the current feature model
   * @param instanceId the id of the instance
   */
  deleteBusinessModel(featureModelId: string, instanceId: number) {
    return this.getFeatureModel(featureModelId).then(featureModel => {
      featureModel.removeInstance(instanceId);
      return this.saveFeatureModel(featureModel);
    });
  }


  /**
   * Add a relationship to the current feature model.
   *
   * @param featureModelId id of the current feature model
   * @param relationshipType type of the relationship
   * @param fromFeatureId id of the first feature
   * @param toFeatureId id of the second feature
   */
  addRelationship(featureModelId: string, relationshipType: RelationshipType, fromFeatureId: string, toFeatureId: string) {
    return this.getFeatureModel(featureModelId).then(featureModel => {
      featureModel.addRelationship(relationshipType, fromFeatureId, toFeatureId);
      return this.saveFeatureModel(featureModel);
    });
  }

  /**
   * Remove a relationship from the current feature model.
   * @param featureModelId id of the current feature model
   * @param relationshipType type of the relationship
   * @param fromFeatureId id of the first feature
   * @param toFeatureId id of the second feature
   */
  removeRelationship(featureModelId: string, relationshipType: RelationshipType, fromFeatureId: string, toFeatureId: string) {
    return this.getFeatureModel(featureModelId).then(featureModel => {
      featureModel.removeRelationship(relationshipType, fromFeatureId, toFeatureId);
      return this.saveFeatureModel(featureModel);
    });
  }

  /**
   * Delete the current feature with all dependencies.
   * @param featureModelId id of the current feature model
   * @param featureId id of the current feature
   */
  deleteFeature(featureModelId: string, featureId: string) {
    return this.getFeatureModel(featureModelId).then(featureModel => {
      featureModel.removeFeature(featureId);
      return this.saveFeatureModel(featureModel);
    });
  }

  /**
   * Update the current feature.
   * @param featureModelId id of the current feature model
   * @param featureId id of the current feature
   * @param feature the new values of the feature (values will be copied to the current object)
   * @param subfeatureOf is a subfeature of
   */
  updateFeature(
    featureModelId: string, featureId: string, feature: Partial<Feature>, subfeatureOf: string) {
    return this.getFeatureModel(featureModelId).then(featureModel => {
      featureModel.updateFeature(featureId, subfeatureOf, feature);
      return this.saveFeatureModel(featureModel);
    });
  }

  /**
   * Add a new feature to the feature model.
   * @param featureModelId id of the feature model
   * @param feature the feature to add to the feature model (values will be copied to a new object)
   * @param subfeatureOf is subfeature of
   */
  addFeature(featureModelId: string, feature: Partial<Feature>, subfeatureOf: string) {
    return this.getFeatureModel(featureModelId).then(featureModel => {
      featureModel.addFeature(feature, subfeatureOf);
      return this.saveFeatureModel(featureModel);
    });
  }

  /**
   * Add a new feature to the feature model and add it as to an instance.
   *
   * @param featureModelId id of the feature model
   * @param featureName name of the feature
   * @param type is the current feature optional or mandatory
   * @param subfeatureConnections has the current feature or subfeatures or xor subfeatures or none of both
   * @param subfeatureOf is subfeature of
   * @param instanceId the id of the instance
   */
  addNewFeatureToInstance(
    featureModelId: string, featureName: string, type: FeatureType, subfeatureConnections: SubfeatureConnectionsType,
    subfeatureOf: string, instanceId: number) {
    return this.getFeatureModel(featureModelId).then(featureModel => {
      const feature = featureModel.addFeature({name: featureName, type, subfeatureConnections}, subfeatureOf);
      featureModel.addFeatureToInstance(instanceId, feature.id);
      return this.saveFeatureModel(featureModel);
    });
  }

  addFeatureMerge(
    featureModelId: string, feature: Partial<Feature>, subfeatureOf: string, expertModelId: string, expertModelFeatureId: string) {
    return this.getFeatureModel(expertModelId).then(
      expertModel => this.getFeatureModel(featureModelId).then(featureModel => {
        const newFeature = featureModel.addFeature(feature, subfeatureOf);
        featureModel.addExpertModelTrace(expertModel, expertModelFeatureId, newFeature.id);
        return this.saveFeatureModel(featureModel);
      })
    );
  }

  addTrace(featureModelId: string, featureId: string, expertModelId: string, expertModelFeatureId: string) {
    return this.getFeatureModel(expertModelId).then(
      expertModel => this.getFeatureModel(featureModelId).then(
        featureModel => {
          featureModel.addExpertModelTrace(expertModel, expertModelFeatureId, featureId);
          return this.saveFeatureModel(featureModel);
        })
    );
  }

  deleteTrace(featureModelId: string, featureId: string, expertModelId: string) {
    return this.getFeatureModel(featureModelId).then(featureModel => {
      featureModel.removeTrace(featureId, expertModelId);
      return this.saveFeatureModel(featureModel);
    });
  }

  private saveFeatureModel(featureModel: FeatureModel): Promise<PouchDB.Core.Response> {
    return this.db.put(featureModel.toPouchDb());
  }

  /**
   * Add default data to the database.
   */
  public addDefaultData() {
    return this.db.destroy().then(() => {
      this.db = new PouchDB(this.databaseName);

      return this.db.bulkDocs(examples as any[]);
    }, error => {
      return error;
    });
  }
}
