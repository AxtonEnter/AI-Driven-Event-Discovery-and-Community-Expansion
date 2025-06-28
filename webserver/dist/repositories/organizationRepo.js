import { knex } from "../db/index.js";
import { getRegions, insertRegion } from "./regionRepo.js";
export async function getOrganizationByID(id) {
    return await knex("organizations").select().where({ id }).first();
}
export async function getOrganizations() {
    return await knex("organizations").select();
}
export async function getOrganizationsIDsNamesUrls() {
    return await knex("organizations").select("id", "name", "url");
}
export async function purgeOrganizations() {
    await knex("organizations").delete();
}
export function parseCSVForOrganizations(csv) {
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
async function convertCsvOrganizationsToPartials(csvOrgs, onNewRegion) {
    var partials = [];
    return await getRegions().then((regions) => {
        var newRegions = [];
        csvOrgs.forEach(async (org) => {
            if (onNewRegion === "add" && org.billingCity != "" && org.billingState != "") {
                if (newRegions.includes(`${org.billingCity}, ${org.billingState}`)
                    || regions.find((item) => item.name === `${org.billingCity}, ${org.billingState}`)) {
                    partials.push({ cms_id: org.cmsId, name: org.accountName, org_url: org.website, koa_url: org.koaUrl, region: `${org.billingCity}, ${org.billingState}` });
                }
                else {
                    try {
                        await insertRegion(`${org.billingCity}, ${org.billingState}`).then(() => {
                            partials.push({ cms_id: org.cmsId, name: org.accountName, org_url: org.website, koa_url: org.koaUrl, region: `${org.billingCity}, ${org.billingState}` });
                            newRegions.push(`${org.billingCity}, ${org.billingState}`);
                        });
                    }
                    catch (e) {
                    }
                }
            }
            else {
                partials.push({ cms_id: org.cmsId, name: org.accountName, org_url: org.website, koa_url: org.koaUrl });
            }
        });
    }).then(() => {
        return partials;
    });
}
export async function insertCsvOrganizations(organizations) {
    await knex("organizations").insert(await convertCsvOrganizationsToPartials(organizations, "add"));
}
//# sourceMappingURL=organizationRepo.js.map