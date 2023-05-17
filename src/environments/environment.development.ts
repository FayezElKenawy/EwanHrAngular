export const environment = {
  production: true,
  name: "App.Titles.TrialVersion",
  hostingFolder: "/ERP.IndividualSector",

  coreApiUrl: "http://185.230.211.136:62/BroaERP.Core.API",
  reportingApiUrl: "http://185.230.211.136:62/BroaERP.Reporting.API",

  coreUrl: "http://185.230.211.136:62/ERP.Core",
  individualSectorURL: "http://185.230.211.136:62/ERP.IndividualSector",
  businessSectorURL: "http://185.230.211.136:62/ERP.BusinessSector",
  houseLabourSectorUrl: "http://185.230.211.136:62/ERP.HouseLabourSector",

  storagePath: "http://185.230.211.136:62/BroaERP.Core.API/Uploading/File/Public",
  storagePhysicalPath: "C:\\BroaERP\\Development\\UploadFolder\\",

  mapKey: "AIzaSyCMk0rodttpnH6PaTd0O6l6lcZfbXzCc8Q",
  timeoutPeriod: 5 * 60                    // in seconds
};
