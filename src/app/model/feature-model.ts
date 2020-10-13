import { Author } from './author';
import { Feature, FeatureType, SubfeatureConnectionsType } from './feature';
import { Trace } from './trace';
import { Instance } from './instance';
import { RelationshipType } from './relationships';

export class FeatureModel {

  // JSON Schema (stored)
  name: string;
  description: string;
  version: string;
  copyright: string;
  author: Author;
  features: { [id: string]: Feature } = {
    'value-propositions': new Feature('value-propositions', null, {name: 'Value Propositions'}),
    'customer-segments': new Feature('customer-segments', null, {name: 'Customer Segment'}),
    'customer-relationships': new Feature('customer-relationships', null, {name: 'Customer Relationships'}),
    channels: new Feature('channels', null, {name: 'Customer Channels'}),
    'key-partners': new Feature('key-partners', null, {name: 'Key Partners'}),
    'key-activities': new Feature('key-activities', null, {name: 'Key Activities'}),
    'key-resources': new Feature('key-resources', null, {name: 'Key Resources'}),
    'revenue-streams': new Feature('revenue-streams', null, {name: 'Revenue Streams'}),
    'cost-structure': new Feature('cost-structure', null, {name: 'Cost Structure'})
  };
  instances: Instance[] = [];

  // stored
  // tslint:disable-next-line:variable-name needed by PouchDB
  _id: string;
  // tslint:disable-next-line:variable-name needed by PouchDB
  _rev: string;
  expertModel = false;
  expertModelTraces: { [expertModelId: string]: Trace } = {};

  nextInstanceId: number;

  constructor(featureModel: Partial<FeatureModel>) {
    this.nextInstanceId = featureModel.instances ? featureModel.instances.length : 0;
    Object.assign(this, featureModel);
    this.author = new Author(this.author);
    Object.entries(this.features).forEach(([id, feature]) => this.features[id] = new Feature(id, null, feature));
    Object.entries(this.expertModelTraces).forEach(([id, trace]) => this.expertModelTraces[id] = new Trace(trace));
    this.instances = this.instances.map((instance, index) => new Instance(index, instance));
  }

  /**
   * Called to check whether this feature model is consistent. Raises an error if not.
   */
  checkFormalConsistency() {
    // has the nine root canvas blocks
    const blocks = [
      'value-propositions', 'customer-segments', 'customer-relationships', 'channels', 'key-partners', 'key-activities', 'key-resources',
      'revenue-streams', 'cost-structure'
    ];
    if (!blocks.every((id) => id in this.features)) {
      throw new Error('Missing canvas blocks');
    }

    // has unique feature ids and only references valid features in relationships
    const featureIds = new Set<string>();
    this.iterateFeatures((feature: Feature) => {
      if (featureIds.has(feature.id)) {
        throw new Error('Feature id ' + feature.id + ' is not unique');
      } else {
        featureIds.add(feature.id);
      }
      return false;
    });
    this.iterateFeatures((feature: Feature) => {
      if (!feature.relationships.getAllReferencedFeatureIds().every((id) => featureIds.has(id))) {
        throw new Error('Relationships of feature ' + feature.id + ' reference a non existing feature id');
      }
      return false;
    });

    // instances use at least the nine root canvas blocks
    if (!this.instances.every((instance) => blocks.every((id) => instance.usedFeatures.includes(id)))) {
      throw new Error('Instance does not reference all nine root canvas blocks');
    }

    // instances only reference valid features
    if (!this.instances.every((instance) => instance.usedFeatures.every((id) => featureIds.has(id)))) {
      throw new Error('Instance references non existing feature id');
    }
  }

  /**
   * Update the author of this feature model with new values
   *
   * @param author the new values of the author (values will be copied to the current object)
   */
  updateAuthor(author: Partial<Author>) {
    this.author.update(author);
  }

  /**
   * Add a feature to the feature model
   *
   * @param feature the feature to add to the feature model (values will be copied to a new object)
   * @param featureId the feature id of the parent model
   * @return the added feature
   */
  addFeature(feature: Partial<Feature>, featureId: string): Feature {
    const parent = this.getFeature(featureId);
    if (!feature.id) {
      feature.id = this.getFeatureId(feature.name);
    }
    return parent.addSubfeature(feature);
  }

  /**
   * Get the next unique feature id by name
   *
   * @param featureName the name of the feature
   */
  private getFeatureId(featureName: string) {
    const id = Feature.nameToId(featureName);
    const featureIds = this.getFeatureList()
      .map((f) => f.id)
      .filter((fId) => fId.startsWith(id));
    if (featureIds.length === 0) {
      return id;
    }
    const currentCount = Math.max(
      ...featureIds
        .map((fId) => fId.substring(id.length + 1))
        .filter((fId) => /^[0-9]+$/.test(fId))
        .map((fId) => parseInt(fId, 10)),
      0
    );
    return id + '-' + (currentCount + 1);
  }

  /**
   * Remove a feature from the feature model
   *
   * @param featureId the feature of the feature
   */
  removeFeature(featureId: string) {
    const feature = this.getFeature(featureId);
    const parent = feature.parent;
    if (parent === null) {
      throw new Error('Can not remove root features');
    }
    parent.removeSubfeature(featureId);

    // * Clean up references
    const featureList = feature.getAllSubfeatures();
    featureList.push(feature);
    const featureIdList = featureList.map((f) => f.id);

    // ** Relationships
    const removeRelationships = (f: Feature) => {
      f.removeRelationships(featureIdList);
      return false;
    };
    this.iterateFeatures(removeRelationships);

    // ** Instances
    this.instances.forEach((instance) => instance.removeFeatures(featureIdList));

    // ** Traces
    for (const f of featureList) {
      for (const [expertModelId, expertModelFeatureId] of Object.entries(f.expertModelTrace)) {
        this.expertModelTraces[expertModelId].deleteTrace(expertModelFeatureId);
      }
    }
  }

  /**
   * Update a feature of this feature model
   *
   * @param featureId the feature of the feature
   * @param parentFeatureId the feature id of the parent feature
   * @param feature the new values of the feature (values will be copied to the current object)
   */
  updateFeature(featureId: string, parentFeatureId: string, feature: Partial<Feature>) {
    const currentFeature = this.getFeature(featureId);
    currentFeature.update(feature);
    const currentParent = currentFeature.parent;
    if (currentParent === null && parentFeatureId !== null) {
      throw new Error('Can not move root features');
    }
    if (currentParent !== null && parentFeatureId === null) {
      throw new Error('Can not move to root features');
    }
    if (currentParent !== null && currentParent.id !== parentFeatureId) {
      const newParent = this.getFeature(parentFeatureId);
      currentParent.removeSubfeature(featureId);
      newParent.addSubfeature(currentFeature);
    }
  }

  /**
   * Get a list of all features with their id and their levelname
   */
  getFeatureList(): { id: string, levelname: string }[] {
    const featureList: { id: string, levelname: string }[] = [];
    const addToFeatureList = (feature: Feature) => {
      featureList.push({id: feature.id, levelname: feature.getLevelname()});
      return false;
    };
    this.iterateFeatures(addToFeatureList);
    return featureList;
  }

  /**
   * Get feature map that maps id of feature to the feature
   *
   * @return the feature map
   */
  getFeatureMap(): { [id: string]: Feature } {
    const featureMap: { [id: string]: Feature } = {};
    const addToFeatureMap = (feature: Feature) => {
      featureMap[feature.id] = feature;
      return false;
    };
    this.iterateFeatures(addToFeatureMap);
    return featureMap;
  }

  /**
   * Get a feature of this feature model by its id
   *
   * @param featureId the feature id of the feature to get
   */
  getFeature(featureId: string) {
    let feature: Feature = null;
    const isFeature = (f: Feature) => {
      if (f.id === featureId) {
        feature = f;
        return true;
      }
      return false;
    };
    this.iterateFeatures(isFeature);
    if (feature === null) {
      throw new Error('Feature with id ' + featureId + ' does not exist on feature model ' + this.name);
    }
    return feature;
  }

  // Relationships between features

  addRelationship(relationshipType: RelationshipType, fromFeatureId: string, toFeatureId: string) {
    const fromFeature = this.getFeature(fromFeatureId);
    this.getFeature(toFeatureId); // to check whether the feature really exists
    fromFeature.addRelationship(relationshipType, toFeatureId);
  }

  removeRelationship(relationshipType: RelationshipType, fromFeatureId: string, toFeatureId: string) {
    const fromFeature = this.getFeature(fromFeatureId);
    fromFeature.removeRelationship(relationshipType, toFeatureId);
  }

  // Expert Models

  /**
   * Add expert model to this company model
   *
   * @param expertModelId the expert model id
   */
  addExpertModel(expertModelId: string) {
    if (this.expertModel) {
      throw new Error('Can not select expert model on an expert model');
    }
    this.expertModelTraces[expertModelId] = new Trace({});
    for (const feature of Object.values(this.features)) {
      this.expertModelTraces[expertModelId].addTrace(feature.id, feature.id);
      feature.addTrace(expertModelId, feature.id);
    }
  }

  /**
   * Remove expert model from this company model
   *
   * @param expertModelId the expert model id
   */
  removeExpertModel(expertModelId: string) {
    if (this.expertModel) {
      throw new Error('Can not select expert model on an expert model');
    }
    delete this.expertModelTraces[expertModelId];
    this.iterateFeatures((feature) => {
      feature.removeTrace(expertModelId);
      return false;
    });
  }

  /**
   * Add a trace to an expert model for a company feature. Also adds cross tree relationships if possible.
   *
   * @param expertModel the expert model to trace to
   * @param expertFeatureId the feature id of the feature in the expert model
   * @param companyFeatureId the feature id of the feature in the company model
   */
  addExpertModelTrace(expertModel: FeatureModel, expertFeatureId: string, companyFeatureId: string) {
    if (this.expertModel) {
      throw new Error('Can not add trace to expert model on an expert model');
    }
    if (!expertModel.expertModel) {
      throw new Error('Can not add trace to non expert model');
    }
    const expertFeature = expertModel.getFeature(expertFeatureId);
    const companyFeature = this.getFeature(companyFeatureId);
    companyFeature.addTrace(expertModel._id, expertFeatureId);
    this.expertModelTraces[expertModel._id].addTrace(expertFeatureId, companyFeatureId);

    // Add cross tree relationships
    this.addTraceRelationship(expertModel._id, expertFeature, companyFeatureId, RelationshipType.REQUIRES);
    this.addTraceRelationship(expertModel._id, expertFeature, companyFeatureId, RelationshipType.EXCLUDES);
    this.addTraceRelationship(expertModel._id, expertFeature, companyFeatureId, RelationshipType.SUPPORTS);
    this.addTraceRelationship(expertModel._id, expertFeature, companyFeatureId, RelationshipType.HURTS);

    const addRelationship = (eF: Feature) => {
      if (eF.relationships.requires.includes(expertFeatureId)) {
        const cFId = this.expertModelTraces[expertModel._id].expertFeatureIdMap[eF.id];
        if (cFId) {
          this.addRelationship(RelationshipType.REQUIRES, cFId, companyFeatureId);
        }
      }
      if (eF.relationships.excludes.includes(expertFeatureId)) {
        const cFId = this.expertModelTraces[expertModel._id].expertFeatureIdMap[eF.id];
        if (cFId) {
          this.addRelationship(RelationshipType.EXCLUDES, cFId, companyFeatureId);
        }
      }
      if (eF.relationships.supports.includes(expertFeatureId)) {
        const cFId = this.expertModelTraces[expertModel._id].expertFeatureIdMap[eF.id];
        if (cFId) {
          this.addRelationship(RelationshipType.SUPPORTS, cFId, companyFeatureId);
        }
      }
      if (eF.relationships.hurts.includes(expertFeatureId)) {
        const cFId = this.expertModelTraces[expertModel._id].expertFeatureIdMap[eF.id];
        if (cFId) {
          this.addRelationship(RelationshipType.HURTS, cFId, companyFeatureId);
        }
      }
      return false;
    };
    expertModel.iterateFeatures(addRelationship);
  }

  /**
   * Adds traces to the feature
   *
   * @param expertModelId the expert model id
   * @param expertFeature the expert feature to lookup the relationships
   * @param companyFeatureId the id of the company feature to add the relationships to
   * @param relationshipType the relationship type to handle
   */
  private addTraceRelationship(
    expertModelId: string, expertFeature: Feature, companyFeatureId: string, relationshipType: RelationshipType) {
    let relationships: string[];
    switch (relationshipType) {
      case RelationshipType.REQUIRES:
        relationships = expertFeature.relationships.requires;
        break;
      case RelationshipType.EXCLUDES:
        relationships = expertFeature.relationships.excludes;
        break;
      case RelationshipType.SUPPORTS:
        relationships = expertFeature.relationships.supports;
        break;
      case RelationshipType.HURTS:
        relationships = expertFeature.relationships.hurts;
        break;
    }
    for (const relExpertFeatureId of relationships) {
      const relCompanyFeatureId = this.expertModelTraces[expertModelId].expertFeatureIdMap[relExpertFeatureId];
      if (relCompanyFeatureId) {
        this.addRelationship(relationshipType, companyFeatureId, relCompanyFeatureId);
      }
    }
  }

  /**
   * Remove a trace to an expert feature
   *
   * @param companyFeatureId the id of the company feature that has a trace to the expert feature
   * @param expertModelId the id of the expert model
   */
  removeTrace(companyFeatureId: string, expertModelId: string) {
    const feature = this.getFeature(companyFeatureId);
    if (companyFeatureId in this.features) {
      throw new Error('Can not delete trace of main features');
    }
    const features = feature.getAllSubfeatures();
    features.push(feature);
    for (const featureTraceToDelete of features) {
      this.expertModelTraces[expertModelId].deleteTrace(featureTraceToDelete.expertModelTrace[expertModelId]);
      featureTraceToDelete.removeTrace(expertModelId);
    }
  }

  // Instances

  /**
   * Add an instance to this feature model
   *
   * @param instance the instance to add to this feature model (values will be copied to a new object)
   * @return the new instance
   */
  addInstance(instance: Partial<Instance>): Instance {
    const addedInstance = new Instance(this.nextInstanceId++, instance);
    this.instances.push(addedInstance);
    return addedInstance;
  }

  /**
   * Get an instance of this feature model
   *
   * @param instanceId the id of the instance
   */
  getInstance(instanceId: number) {
    return this.instances.find((instance) => instance.id === instanceId);
  }

  /**
   * Remove an instance from this feature model
   *
   * @param instanceId the id of the instance
   */
  removeInstance(instanceId: number) {
    this.instances = this.instances.filter((instance) => instance.id !== instanceId);
  }

  /**
   * Update an instance of this feature model
   *
   * @param instanceId the id of the instance
   * @param instance the new values of the instance (values will be copied to the current object)
   */
  updateInstance(instanceId: number, instance: Partial<Instance>) {
    const currentInstance = this.instances.find((i) => i.id === instanceId);
    currentInstance.update(instance);
  }

  /**
   * Adapts an instance by copy it and add it as a new instance with a new name
   *
   * @param instanceId the id of the instance
   * @param adaptationName the new name of the instance
   */
  adaptInstance(instanceId: number, adaptationName: string) {
    const instance = this.instances.find((i) => i.id === instanceId);
    this.addInstance(instance);
    this.instances[this.instances.length - 1].update({id: this.nextInstanceId - 1, name: adaptationName});
  }

  /**
   * Add a feature to an instance
   *
   * @param instanceId the id of the instance
   * @param featureId the feature id of the feature to add to the instance
   */
  addFeatureToInstance(instanceId: number, featureId: string) {
    this.getFeature(featureId); // to check whether the feature really exists
    const instance = this.instances.find((i) => i.id === instanceId);
    instance.addFeature(featureId);
  }

  /**
   * Remove a feature and its subfeatures from an instance
   *
   * @param instanceId the id of the instance
   * @param featureId the feature id of the feature to remove from the instance
   */
  removeFeatureFromInstance(instanceId: number, featureId: string) {
    const instance = this.getInstance(instanceId);
    const feature = this.getFeature(featureId);
    const featureIds = feature.getAllSubfeatures().map((f) => f.id);
    instance.removeFeature(feature.id);
    instance.removeFeatures(featureIds);
  }

  /**
   * Checks the conformance of an instance
   *
   * @param instanceId the id of the instance
   * @return featureIds that have problems and errors as messages
   */
  checkConformanceOfInstance(instanceId: number): {
    errorFeatureIds: string[],
    errors: string[],
    warningFeatureIds: string[],
    warnings: string[],
    strengthFeatureIds: string[],
    strengths: string[],
    hintFeatureIds: string[],
    hints: string[]
  } {
    const instance = this.instances.find((i) => i.id === instanceId);
    const errorFeatureIds = new Set<string>();
    const warningFeatureIds = new Set<string>();
    const strengthFeatureIds = new Set<string>();
    const hintFeatureIds = new Set<string>();
    const errors: string[] = [];
    const warnings: string[] = [];
    const strengths: string[] = [];
    const hints: string[] = [];

    const filter = (feature: Feature) => instance.usedFeatures.includes(feature.id) || feature.type === FeatureType.MANDATORY;
    const checkFeature = (feature: Feature) => {
      const selected = instance.usedFeatures.includes(feature.id);
      const selectedSubfeaturesLength = Object.keys(feature.subfeatures).filter((id: string) => instance.usedFeatures.includes(id)).length;

      if (feature.type === FeatureType.MANDATORY && !selected) {
        errorFeatureIds.add(feature.id);
        errors.push(feature.name + ' is mandatory');
      }

      switch (feature.subfeatureConnections) {
        case SubfeatureConnectionsType.OR:
          if (selectedSubfeaturesLength === 0) {
            errorFeatureIds.add(feature.id);
            errors.push(feature.name + ' needs at least one subfeature');
          }
          break;
        case SubfeatureConnectionsType.XOR:
          if (selectedSubfeaturesLength !== 1) {
            errorFeatureIds.add(feature.id);
            errors.push(feature.name + ' needs exactly one subfeature');
          }
          break;
      }

      const missingRequiredFeatures = feature.relationships.requires.filter((id: string) => !instance.usedFeatures.includes(id));
      if (missingRequiredFeatures.length > 0) {
        errorFeatureIds.add(feature.id);
        missingRequiredFeatures.forEach((id: string) => errors.push(
          feature.name + ' requires the feature ' + this.getFeature(id).name)
        );
      }

      const disallowedFeatures = feature.relationships.excludes.filter((id: string) => instance.usedFeatures.includes(id));
      if (disallowedFeatures.length > 0) {
        errorFeatureIds.add(feature.id);
        disallowedFeatures.forEach((id: string) => errors.push(
          feature.name + ' excludes the feature ' + this.getFeature(id).name)
        );
      }

      const supportedFeatures = feature.relationships.supports.filter((id: string) => instance.usedFeatures.includes(id));
      if (supportedFeatures.length > 0) {
        strengthFeatureIds.add(feature.id);
        supportedFeatures.forEach((id: string) => strengths.push(
          feature.name + ' supports the feature ' + this.getFeature(id).name)
        );
      }

      const hurtedFeatures = feature.relationships.hurts.filter((id: string) => instance.usedFeatures.includes(id));
      if (hurtedFeatures.length > 0) {
        warningFeatureIds.add(feature.id);
        hurtedFeatures.forEach((id: string) => warnings.push(
          feature.name + ' hurts the feature ' + this.getFeature(id).name)
        );
      }

      return false;
    };
    this.iterateFeatures(checkFeature, filter);

    const checkHint = (feature: Feature) => {

      if (!instance.usedFeatures.includes(feature.id) && this.isFeatureEasyAddable(instance, feature)) {
        feature.relationships.supports.forEach((id) => {
          if (instance.usedFeatures.includes(id)) {
            hints.push('Including ' + feature.name + ' would support ' + this.getFeature(id).name);
            hintFeatureIds.add(feature.id);
            for (let f = feature.parent; f !== null; f = f.parent) {
              if (instance.usedFeatures.includes(f.id)) {
                break;
              }
              hintFeatureIds.add(f.id);
            }
          }
        });
      }

      return false;
    };
    this.iterateFeatures(checkHint);

    return {
      errorFeatureIds: Array.from(errorFeatureIds),
      errors,
      warningFeatureIds: Array.from(warningFeatureIds),
      warnings,
      strengthFeatureIds: Array.from(strengthFeatureIds),
      strengths,
      hintFeatureIds: Array.from(hintFeatureIds),
      hints
    };
  }

  /**
   * Checks whether the feature can be easily added to the instance. Easily means that all requirements are satisfied and
   * the feature is not excluded by any other feature nor it is excluded by the tree relationship XOR and every parent
   * of this feature is already added to the instance or it would be possible to add it easily too.
   *
   * @param instance the instance to add the feature to
   * @param feature the feature to add to the instance
   * @return whether it would be easily possible to add the feature
   */
  private isFeatureEasyAddable(instance: Instance, feature: Feature): boolean {
    return instance.usedFeatures.includes(feature.id) ||
      feature.relationships.excludes.every((id) => !instance.usedFeatures.includes(id)) &&
      instance.usedFeatures.every((id) => !this.getFeature(id).relationships.excludes.includes(feature.id)) &&
      (
        feature.parent === null ||
        feature.parent.subfeatureConnections !== SubfeatureConnectionsType.XOR ||
        Object.keys(feature.parent.subfeatures).every((id) => !instance.usedFeatures.includes(id))
      ) &&
      feature.relationships.requires.every((id) => instance.usedFeatures.includes(id)) &&
      (feature.parent === null || this.isFeatureEasyAddable(instance, feature.parent));
  }

  /**
   * Compare two instances and get a feature map with comparison percentages per feature
   *
   * @param instanceIdA the id of the first instance
   * @param instanceIdB the id of the second instance
   * @return a mapping with feature id to percentage
   */
  compareInstances(instanceIdA: number, instanceIdB: number): { [id: string]: number } {
    return this.compareGivenInstances(this.getInstance(instanceIdA), this.getInstance(instanceIdB));
  }

  /**
   * Compare two instances and get a feature map with comparison percentages per feature
   *
   * @param instanceA the id of the first instance
   * @param instanceB the id of the second instance
   * @return a mapping with feature id to percentage
   */
  compareGivenInstances(instanceA: Instance, instanceB: Instance): { [id: string]: number } {
    const features: Feature[] = [];
    this.iterateFeatures((feature) => {
      features.unshift(feature);
      return false;
    });
    const map: { [id: string]: number } = {};
    const outMap: { [id: string]: number } = {};
    for (const feature of features) {
      const inA = instanceA.usedFeatures.includes(feature.id);
      const inB = instanceB.usedFeatures.includes(feature.id);
      if (inA === inB) {
        if (inA) {
          const subfeatures = Object.keys(feature.subfeatures).filter((id) => id in map);
          if (subfeatures.length > 0) {
            const count = subfeatures.map((id) => outMap[id]).reduce((agg, f) => agg + f, 0);
            map[feature.id] = count / subfeatures.length;
            outMap[feature.id] = (count + 100) / (subfeatures.length + 1);
          } else {
            map[feature.id] = 100;
            outMap[feature.id] = 100;
          }
        }
      } else {
        map[feature.id] = 0;
        outMap[feature.id] = 0;
      }
    }
    return map;
  }

  /**
   * Convert expert model instance to instance of this feature model. Expert model must be completely merged.
   * Does not add the instance to this model.
   *
   * @param expertModelId the id of the expert model
   * @param expertInstance the instance of the expert model that should be converted
   * @return the converted instance
   */
  convertExpertInstance(expertModelId: string, expertInstance: Instance): Instance {
    const instance = new Instance(expertInstance.id, expertInstance);
    instance.usedFeatures = instance.usedFeatures.map(
      (expertFeatureId) => this.expertModelTraces[expertModelId].expertFeatureIdMap[expertFeatureId]
    );

    // Add missing main features to instance
    this.iterateFeatures((feature) => {
      if (instance.usedFeatures.includes(feature.id)) {
        let parent = feature.parent;
        while (parent !== null) {
          if (!instance.usedFeatures.includes(parent.id)) {
            instance.usedFeatures.push(parent.id);
            parent = parent.parent;
          } else {
            break;
          }
        }
      }
      return false;
    });

    return instance;
  }

  // Export

  toPouchDb(): any {
    const features = {};
    Object.entries(this.features).forEach(([id, feature]) => features[id] = feature.toPouchDb());
    const expertModelTraces = {};
    Object.entries(this.expertModelTraces).forEach(([id, trace]) => expertModelTraces[id] = trace.toPouchDb());
    return {
      name: this.name,
      description: this.description,
      version: this.version,
      copyright: this.copyright,
      author: this.author.toPouchDb(),
      features,
      instances: this.instances.map((instance) => instance.toPouchDb()),
      _id: this._id,
      _rev: this._rev,
      expertModel: this.expertModel,
      expertModelTraces,
      nextInstanceId: this.nextInstanceId
    };
  }

  toJSON() {
    return {
      name: this.name,
      description: this.description,
      version: this.version,
      copyright: this.copyright,
      author: this.author,
      features: this.features,
      instances: this.instances
    };
  }

  // Helper Functions

  /**
   * Iterates over all features until the function returns true.
   * Iterates from top to bottom with all nested features
   *
   * @param func function to use on the features
   * @param filter function to decide whether to walk through this part of the tree
   */
  private iterateFeatures(func: (feature: Feature) => boolean, filter: (feature: Feature) => boolean = () => true) {
    const featureStack: Feature[] = [];

    featureStack.push(...Object.values(this.features).reverse().filter(filter));

    while (featureStack.length > 0) {
      const current = featureStack.pop();

      if (func(current)) {
        return;
      }

      featureStack.push(...Object.values(current.subfeatures).reverse().filter(filter));
    }
  }

}
