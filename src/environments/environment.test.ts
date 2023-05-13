export const environment = {
  production: true,
  name: "App.Titles.TrialVersion",
  hostingFolder: "/ERP.IndividualSector",

  coreApiUrl: "http://185.230.211.136:64/BroaERP.Core.API",
  individualSectorApiUrl: "http://185.230.211.136:64/BroaERP.IndividualSector.API",
  reportingApiUrl: "http://185.230.211.136:64/BroaERP.Reporting.API",
  
  coreUrl: "http://185.230.211.136:64/ERP.Core",
  businessSectorURL: "http://185.230.211.136:64/ERP.BusinessSector",
  houseLabourSectorUrl: "http://185.230.211.136:64/ERP.HouseLabourSector",
  individualSectorURL: "http://185.230.211.136:64/ERP.IndividualSector",
    
  storagePhysicalPath: "C:\\BroaERP\\Test\\UploadFolder\\",
  storagePath: "http://185.230.211.136:64/BroaERP.Core.API/Uploading/File/Public",

  mapKey: "AIzaSyCMk0rodttpnH6PaTd0O6l6lcZfbXzCc8Q",
  timeoutPeriod: 5 * 60                    // in seconds
};
