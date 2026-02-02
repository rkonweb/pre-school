const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const indiaGeography = {
    states: [
        { name: 'Andhra Pradesh', code: 'AP', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati'] },
        { name: 'Arunachal Pradesh', code: 'AR', cities: ['Itanagar', 'Tawang', 'Ziro'] },
        { name: 'Assam', code: 'AS', cities: ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat'] },
        { name: 'Bihar', code: 'BR', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'] },
        { name: 'Chhattisgarh', code: 'CG', cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba'] },
        { name: 'Goa', code: 'GA', cities: ['Panaji', 'Vasco da Gama', 'Margao'] },
        { name: 'Gujarat', code: 'GJ', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'] },
        { name: 'Haryana', code: 'HR', cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala'] },
        { name: 'Himachal Pradesh', code: 'HP', cities: ['Shimla', 'Dharamshala', 'Solan'] },
        { name: 'Jharkhand', code: 'JH', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'] },
        { name: 'Karnataka', code: 'KA', cities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi'] },
        { name: 'Kerala', code: 'KL', cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'] },
        { name: 'Madhya Pradesh', code: 'MP', cities: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain'] },
        { name: 'Maharashtra', code: 'MH', cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad'] },
        { name: 'Manipur', code: 'MN', cities: ['Imphal'] },
        { name: 'Meghalaya', code: 'ML', cities: ['Shillong'] },
        { name: 'Mizoram', code: 'MZ', cities: ['Aizawl'] },
        { name: 'Nagaland', code: 'NL', cities: ['Kohima', 'Dimapur'] },
        { name: 'Odisha', code: 'OR', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur'] },
        { name: 'Punjab', code: 'PB', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'] },
        { name: 'Rajasthan', code: 'RJ', cities: ['Jaipur', 'Jodhpur', 'Kota', 'Ajmer', 'Udaipur'] },
        { name: 'Sikkim', code: 'SK', cities: ['Gangtok'] },
        { name: 'Tamil Nadu', code: 'TN', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'] },
        { name: 'Telangana', code: 'TG', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam'] },
        { name: 'Tripura', code: 'TR', cities: ['Agartala'] },
        { name: 'Uttar Pradesh', code: 'UP', cities: ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Meerut', 'Noida'] },
        { name: 'Uttarakhand', code: 'UK', cities: ['Dehradun', 'Haridwar', 'Roorkee'] },
        { name: 'West Bengal', code: 'WB', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri'] },
        { name: 'Andaman and Nicobar', code: 'AN', cities: ['Port Blair'] },
        { name: 'Chandigarh', code: 'CH', cities: ['Chandigarh'] },
        { name: 'Delhi', code: 'DL', cities: ['New Delhi', 'North Delhi', 'South Delhi'] },
        { name: 'Jammu and Kashmir', code: 'JK', cities: ['Srinagar', 'Jammu'] },
        { name: 'Ladakh', code: 'LA', cities: ['Leh', 'Kargil'] },
        { name: 'Lakshadweep', code: 'LD', cities: ['Kavaratti'] },
        { name: 'Puducherry', code: 'PY', cities: ['Puducherry'] },
    ]
};

async function seed() {
    console.log('Seeding India Geography...');

    try {
        // 1. Seed Country
        let country = await prisma.masterData.findFirst({
            where: { type: 'COUNTRY', name: 'India' }
        });

        if (!country) {
            country = await prisma.masterData.create({
                data: { type: 'COUNTRY', name: 'India', code: 'IN', parentId: null }
            });
            console.log('- Created Country: India');
        } else {
            console.log('- Country India already exists');
        }

        // 2. Seed States
        for (const stateData of indiaGeography.states) {
            let state = await prisma.masterData.findFirst({
                where: { type: 'STATE', name: stateData.name, parentId: country.id }
            });

            if (!state) {
                state = await prisma.masterData.create({
                    data: {
                        type: 'STATE',
                        name: stateData.name,
                        code: stateData.code,
                        parentId: country.id
                    }
                });
                console.log(`  - Created State: ${stateData.name}`);
            }

            // 3. Seed Cities
            for (const cityName of stateData.cities) {
                let city = await prisma.masterData.findFirst({
                    where: { type: 'CITY', name: cityName, parentId: state.id }
                });

                if (!city) {
                    await prisma.masterData.create({
                        data: {
                            type: 'CITY',
                            name: cityName,
                            parentId: state.id
                        }
                    });
                    // console.log(`    - Created City: ${cityName}`);
                }
            }
        }

        console.log('Geography seeding completed!');
    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
