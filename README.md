# Business Modeling Suite
Describe Business Models through a Business Model Decision Line (BMDL) by using Feature Models

**Important**: This tool is not yet complete. It can contain bugs and some features are missing. This will be fixed until camera ready.

## Introduction
The Business Modeling Suite is a tool to describe Business Models through a combination of the Business Model Canvas (BMC) and a Software Product Line (SPL). We call this concept Business Model Decision Line (BMDL), where each feature describes a single business model decision. Features can be ordered in hierarchies and marked as mandatory or optional for the business models. Moreover, there can be Or (at least one sub-feature is selected) and Alternate (exactly one sub-feature is selected) relationships between a parent and a child feature. To refine the business models, cross-tree constraints for requiring and excluding dependencies can be made.

The current state of the tool allows the creation of feature models and the deriving of business models. New business model decisions of single business models are synchronized with the corresponding feature model to ensure consistency. Moreover, the conformance of business models can be checked with the feature model and occurring conformance errors are explained. The tools is based on the [Angular framework](https://angular.io/) and the [PouchDB database](https://pouchdb.com/) to run directly in the webbrowser.
## Screenshots

| Startpage of the Business Modeling Suite | Creating Feature Model |
| ------ | ------ |
| [![alt text](images/zero_screen_exp.png "Startpage of the Business Modeling Suite")](images/zero_screen_exp.png) | [![alt text](images/first_screen_exp.png "Create Feature Model")](images/first_screen_exp.png) |

| Derive Business Models | Check Conformance |
| ------ | ------ |
| [![alt text](images/second_screen_exp.png "Derive Business Models")](images/second_screen_exp.png) | [![alt text](images/third_screen_exp.png "Check Conformance")](images/third_screen_exp.png) |

## Installation

1. Install [NodeJS](https://nodejs.org) and [AngularCLI](https://cli.angular.io/)
2. Clone Business Modeling Suite repository to your computer
3. Install all NPM packages with `npm install`
4. Configure database
    4.1. Internal database: By default the business modeling suite is using PouchDB zu store data directly in the web storage of the browser. The database can be changed in `src/app/pouchdb.service.ts` within the variable `databaseName` (default: `business-modeling-suite`)
    4.2. External database: The business modeling suite allows also to use a CouchDB database as a persistent storage. For this, you need to change the `databaseName` in `src/app/pouchdb.service.ts` to `http://localhost:4200/database` and specify the url to the CouchDB in `proxy.conf.json` within the variable `target` (default: `http://localhost:5984/business-modeling-suite`)
5. Start service
    5.1. Internal database: Run the web application with `ng serve`
    5.2. External database: Run the web application with `npm start` to use the proxy for the external database
6. Have fun with the tool :)
## Further Information

- **Live Demonstration:** https://blindreviewconference.github.io/business-modeling-suite/
- **Research Paper:** Currently under review

## License
The Business Modeling Suite is released under the MIT license.
