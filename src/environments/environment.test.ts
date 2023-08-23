export const environment = {
  production: false,
  name: 'App.Titles.DevelopingVersion',
  hostingFolder: "/ERP.HR",

  coreApiUrl: 'http://ewan1.uksouth.cloudapp.azure.com:62/BroaERP.Core.API',
  reportingApiUrl: 'http://ewan1.uksouth.cloudapp.azure.com:62/BroaERP.Reporting.API',
  //financeSectorAPIURL:"http://ewan1.uksouth.cloudapp.azure.com:62/Ewan.Finance.API/api",
  
  coreUrl: "http://ewan1.uksouth.cloudapp.azure.com:62/ERP.Core",
  businessSectorURL: "http://ewan1.uksouth.cloudapp.azure.com:62/ERP.BusinessSector",
  houseLabourSectorUrl: "http://ewan1.uksouth.cloudapp.azure.com:62/ERP.HouseLabourSector",
  individualSectorURL: "http://ewan1.uksouth.cloudapp.azure.com:62/ERP.IndividualSector",
  //financeURL:"http://ewan1.uksouth.cloudapp.azure.com:62/ERP.Finance",

  storagePath: 'http://localhost/BroaERP.Core.API/Uploading/File/Public',
  storagePhysicalPath: "C:\\inetpub\\BroaERP\\Developing\\UploadFolder\\",

  mapKey: "AIzaSyCMk0rodttpnH6PaTd0O6l6lcZfbXzCc8Q",
  timeoutPeriod: 5 * 60 * 60                     // in seconds
};
