
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedGeoData() {
    console.log("--- SEEDING DETAILED GEO & GENDER DATA ---");

    // 1. GENDER
    const genders = ["Male", "Female", "Other"];
    console.log("Seeding Gender...");
    for (const g of genders) {
        const existing = await prisma.masterData.findFirst({
            where: { type: "GENDER", name: g }
        });
        if (!existing) {
            await prisma.masterData.create({ data: { type: "GENDER", name: g } });
        }
    }

    // 2. GEOGRAPHICAL DATA (Hierarchical)

    // DATA STRUCTURE
    const geoData = [
        {
            country: "India",
            states: [
                {
                    name: "Maharashtra",
                    cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane"]
                },
                {
                    name: "Karnataka",
                    cities: ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi"]
                },
                {
                    name: "Delhi",
                    cities: ["New Delhi", "North Delhi", "South Delhi"]
                },
                {
                    name: "Tamil Nadu",
                    cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"]
                },
                {
                    name: "Telangana",
                    cities: ["Hyderabad", "Warangal", "Nizamabad"]
                },
                {
                    name: "Gujarat",
                    cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"]
                },
                {
                    name: "West Bengal",
                    cities: ["Kolkata", "Howrah", "Durgapur", "Siliguri"]
                },
                {
                    name: "Uttar Pradesh",
                    cities: ["Lucknow", "Kanpur", "Ghaziabad", "Noida", "Varanasi"]
                },
                {
                    name: "Rajasthan",
                    cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota"]
                },
                {
                    name: "Kerala",
                    cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"]
                }
            ]
        },
        {
            country: "United States",
            states: [
                {
                    name: "California",
                    cities: ["Los Angeles", "San Francisco", "San Diego"]
                },
                {
                    name: "New York",
                    cities: ["New York City", "Buffalo", "Albany"]
                },
                {
                    name: "Texas",
                    cities: ["Houston", "Austin", "Dallas"]
                }
            ]
        },
        {
            country: "United Kingdom",
            states: [
                {
                    name: "England",
                    cities: ["London", "Manchester", "Birmingham"]
                },
                {
                    name: "Scotland",
                    cities: ["Edinburgh", "Glasgow"]
                }
            ]
        },
        {
            country: "Canada",
            states: [
                { name: "Ontario", cities: ["Toronto", "Ottawa"] },
                { name: "British Columbia", cities: ["Vancouver", "Victoria"] }
            ]
        },
        {
            country: "Australia",
            states: [
                { name: "New South Wales", cities: ["Sydney"] },
                { name: "Victoria", cities: ["Melbourne"] }
            ]
        }
    ];

    console.log("Seeding Countries, States, and Cities...");

    for (const cData of geoData) {
        // Create/Find COUNTRY
        let country = await prisma.masterData.findFirst({
            where: { type: "COUNTRY", name: cData.country }
        });

        if (!country) {
            country = await prisma.masterData.create({
                data: { type: "COUNTRY", name: cData.country }
            });
            console.log(`Created Country: ${cData.country}`);
        } else {
            console.log(`Country exists: ${cData.country}`);
        }

        // Process STATES
        for (const sData of cData.states) {
            let state = await prisma.masterData.findFirst({
                where: { type: "STATE", name: sData.name, parentId: country.id }
            });

            if (!state) {
                state = await prisma.masterData.create({
                    data: { type: "STATE", name: sData.name, parentId: country.id }
                });
                // console.log(`  Created State: ${sData.name}`);
            }

            // Process CITIES
            for (const city of sData.cities) {
                const existingCity = await prisma.masterData.findFirst({
                    where: { type: "CITY", name: city, parentId: state.id }
                });

                if (!existingCity) {
                    await prisma.masterData.create({
                        data: { type: "CITY", name: city, parentId: state.id }
                    });
                }
            }
            console.log(`  Processed State: ${sData.name} (${sData.cities.length} cities)`);
        }
    }

    console.log("--- GEO DATA SEEDING COMPLETE ---");
}

seedGeoData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
