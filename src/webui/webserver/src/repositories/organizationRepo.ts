import { knex } from "../db/index.js";
import { OrganizationsRow, RegionsRow } from "../db/tables.js";
import { getRegionByName, getRegions, insertRegion } from "./regionRepo.js";


export async function getOrganizationByID(id: number): Promise<OrganizationsRow | undefined> {
  return await knex("organizations").select().where({ id }).first();
}

export async function getOrganizations(): Promise<OrganizationsRow[]> {
  return await knex("organizations").select();
}

export async function purgeOrganizations(): Promise<void> {
  await knex("organizations").delete();
}

export interface CsvOrganizationRow {
  primaryMarket: string;
  accountName: string;
  website: string;
  billingAddressLine1: string;
  billingCity: string;
  billingStateProvince: string;
  billingZipPostalCode: string;
}

export function parseCSVForOrganizations(csv: string): CsvOrganizationRow[] {
  const lines = csv.split("\n").map(line => line.trim()).filter(line => line);
  const headers = [
    "Primary Market",
    "Account Name",
    "Website",
    "Billing Address Line 1",
    "Billing City",
    "Billing State/Province",
    "Billing Zip/Postal Code"
  ];

  return lines.slice(1).map(line => {
    const values = line.split(",");
    return {
      primaryMarket: values[0] || "",
      accountName: values[1] || "",
      website: values[2] || "",
      billingAddressLine1: values[3] || "",
      billingCity: values[4] || "",
      billingStateProvince: values[5] || "",
      billingZipPostalCode: values[6] || ""
    };
  });
}

interface PartialOrganizationsRow {
  name?: string;
  org_url: string;
  region?: string;
}

async function convertCsvOrganizationsToPartials(csvOrgs: CsvOrganizationRow[], onNewRegion: "add" | "leaveNull") {
  var partials: PartialOrganizationsRow[] = [];

  return await getRegions().then((regions) => {
    var newRegions: string[] = [];

    csvOrgs.forEach(async (org) => {
      //If add mode and location info exists
      if (onNewRegion === "add" && org.billingCity != "" && org.billingStateProvince != "") {
        //If region exists in table
        if (
          newRegions.includes(`${org.billingCity}, ${org.billingStateProvince}`)
          || regions.find((item) => item.name === `${org.billingCity}, ${org.billingStateProvince}`)
        ) {
          //Just add the org record with a region to the array
          partials.push({ name: org.accountName, org_url: org.website, region: `${org.billingCity}, ${org.billingStateProvince}` });
        } else {
          //Add the region to the table and add the org to the array
          await insertRegion(`${org.billingCity}, ${org.billingStateProvince}`).then(() => {
            partials.push({ name: org.accountName, org_url: org.website, region: `${org.billingCity}, ${org.billingStateProvince}` })
            newRegions.push(`${org.billingCity}, ${org.billingStateProvince}`);
          });
        }
      } else {
        //Add the org without a region
        partials.push({ name: org.accountName, org_url: org.website });
      }
    })
  }).then(() => {
    //Wait until the above is completely done before returning
    return partials;
  })
}


export async function insertCsvOrganizations(organizations: CsvOrganizationRow[]) {
  await knex("organizations").insert(convertCsvOrganizationsToPartials(organizations, "add"));
}