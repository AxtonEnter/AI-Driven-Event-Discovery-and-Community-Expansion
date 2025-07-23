import { knex } from "../db/index.js";
import { OrganizationsRow, RegionsRow } from "../db/tables.js";
import { getRegionByName, getRegions, insertRegion } from "./regionRepo.js";


export async function getOrganizationByID(id: number): Promise<OrganizationsRow | undefined> {
  return await knex("organizations").select().where({ id }).first();
}

export async function getOrganizations(): Promise<OrganizationsRow[]> {
  return await knex("organizations").select();
}

export interface MinimalOrganizationsRow {
  id: string;
  name?: string;
  org_url: string;
}

export async function getOrganizationsIDsNamesUrls(): Promise<MinimalOrganizationsRow[]> {
  return await knex("organizations").select("id", "name", "url");
}

export async function purgeOrganizations(): Promise<void> {
  await knex("organizations").delete();
}

export interface CsvOrganizationRow {
  cmsId?: number,
  accountName: string,
  billingAddr1: string,
  billingCity: string,
  billingState: string,
  website: string;
  koaUrl: string;
  primaryMarket: string;
}

export function parseCSVForOrganizations(csv: string): CsvOrganizationRow[] {
  //console.log("CSV: \n" + csv)
  const lines = csv.split("\n").map(line => line.trim()).filter(line => line);
  const headers = [
    "CMS ID",
    "Account Name",
    "Billing Address Line 1",
    "Billing City",
    "Billing State/Province",
    "Website",
    "KOAURL",
    "Primary Market"
  ];

  //console.log("Lines: \n" + lines)

  return lines.slice(1).map(line => {
    const values = line.split(",");
    return {
      cmsId: parseInt(values[0]) || undefined,
      accountName: values[1] || "",
      billingAddr1: values[2] || "",
      billingCity: values[3] || "",
      billingState: values[4] || "",
      website: values[5] || "",
      koaUrl: values[6] || "",
      primaryMarket: values[7] || ""
    };
  });
}

interface PartialOrganizationsRow {
  cms_id?: number;
  name: string;
  org_url: string;
  koa_url: string
  region?: string;
}

async function convertCsvOrganizationsToPartials(csvOrgs: CsvOrganizationRow[], onNewRegion: "add" | "leaveNull"): Promise<PartialOrganizationsRow[]> {
  var partials: PartialOrganizationsRow[] = [];

  return await getRegions().then((regions) => {
    var newRegions: string[] = [];

    console.log("parse")

    csvOrgs.forEach(async (org) => {
      //If add mode and location info exists
      if (onNewRegion === "add" && org.billingCity != "" && org.billingState != "") {
        //If region exists in table
        if (
          newRegions.includes(`${org.billingCity}, ${org.billingState}`)
          || regions.find((item) => item.name === `${org.billingCity}, ${org.billingState}`)
        ) {
          //Just add the org record with a region to the array
          partials.push({ cms_id: org.cmsId, name: org.accountName, org_url: org.website, koa_url: org.koaUrl, region: `${org.billingCity}, ${org.billingState}` });
        } else {
          //Add the region to the table and add the org to the array
          try {
              await insertRegion(`${org.billingCity}, ${org.billingState}`).then(() => {
              partials.push({ cms_id: org.cmsId, name: org.accountName, org_url: org.website, koa_url: org.koaUrl, region: `${org.billingCity}, ${org.billingState}` })
              newRegions.push(`${org.billingCity}, ${org.billingState}`);
            });
          } catch (e: any) {
            //console.warn(e)
          }
        }
      } else {
        //Add the org without a region
        partials.push({ cms_id: org.cmsId, name: org.accountName, org_url: org.website, koa_url: org.koaUrl });
      }
    });
    //console.log(`partials: \n${partials}`)
  }).then(() => {
    //Wait until the above is completely done before returning
    //console.log(`2 ${partials}`)
    return partials;
  })
}


export async function insertCsvOrganizations(organizations: CsvOrganizationRow[]) {
  console.log("insert")
  await knex("organizations").insert(await convertCsvOrganizationsToPartials(organizations, "add"));
}

export async function deleteOrganization(id: number): Promise<boolean> {
  const result = await knex("organizations").where({ id }).delete();
  return result > 0;
}

export async function deleteAllOrganizations(): Promise<boolean> {
  const result = await knex("organizations").delete();
  return result > 0;
}