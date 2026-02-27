import { PrismaClient } from '../src/generated/client_final/index.js';

const prisma = new PrismaClient();

const CANTEEN_ITEMS = [
    // Breakfast items
    { name: "Poha", description: "Flattened rice cooked with onions and peanuts", price: 40, category: ["BREAKFAST"], mealType: "BREAKFAST", dietType: "VEG", foodCategory: "Indian", isAddOn: false },
    { name: "Upma", description: "Savory semolina porridge with vegetables", price: 45, category: ["BREAKFAST"], mealType: "BREAKFAST", dietType: "VEG", foodCategory: "South Indian", isAddOn: false },
    { name: "Idli Sambar", description: "Steamed rice cakes served with lentil soup", price: 50, category: ["BREAKFAST"], mealType: "BREAKFAST", dietType: "VEG", foodCategory: "South Indian", isAddOn: false },
    { name: "Masala Dosa", description: "Crispy crepe with potato filling", price: 60, category: ["BREAKFAST"], mealType: "BREAKFAST", dietType: "VEG", foodCategory: "South Indian", isAddOn: false },
    { name: "Aloo Paratha", description: "Stuffed potato flatbread with curd", price: 55, category: ["BREAKFAST"], mealType: "BREAKFAST", dietType: "VEG", foodCategory: "North Indian", isAddOn: false },
    { name: "Boiled Egg (2pcs)", description: "Farm fresh hard boiled eggs", price: 30, category: ["BREAKFAST"], mealType: "BREAKFAST", dietType: "NON_VEG", foodCategory: "Snacks", isAddOn: true },

    // Lunch / Dinner items
    { name: "Veg Thali", description: "Roti, Rice, Dal, 2 Sabzi, Curd, Sweet", price: 120, category: ["LUNCH", "DINNER"], mealType: "LUNCH", dietType: "VEG", foodCategory: "North Indian", isAddOn: false },
    { name: "Chicken Thali", description: "Roti, Rice, Chicken Curry, Dal, Curd", price: 150, category: ["LUNCH", "DINNER"], mealType: "LUNCH", dietType: "NON_VEG", foodCategory: "North Indian", isAddOn: false },
    { name: "Rajma Chawal", description: "Kidney beans curry with steamed rice", price: 90, category: ["LUNCH"], mealType: "LUNCH", dietType: "VEG", foodCategory: "North Indian", isAddOn: false },
    { name: "Chole Bhature", description: "Spicy chickpea curry with fried bread", price: 100, category: ["LUNCH"], mealType: "LUNCH", dietType: "VEG", foodCategory: "North Indian", isAddOn: false },
    { name: "Veg Fried Rice", description: "Wok tossed rice with fresh vegetables", price: 80, category: ["LUNCH", "DINNER"], mealType: "LUNCH", dietType: "VEG", foodCategory: "Chinese", isAddOn: false },
    { name: "Chicken Fried Rice", description: "Wok tossed rice with chicken chunks", price: 110, category: ["LUNCH", "DINNER"], mealType: "LUNCH", dietType: "NON_VEG", foodCategory: "Chinese", isAddOn: false },
    { name: "Hakka Noodles", description: "Stir fried noodles with veggies", price: 80, category: ["LUNCH", "DINNER"], mealType: "LUNCH", dietType: "VEG", foodCategory: "Chinese", isAddOn: false },
    { name: "Paneer Butter Masala", description: "Cottage cheese in rich tomato gravy", price: 130, category: ["LUNCH", "DINNER"], mealType: "DINNER", dietType: "VEG", foodCategory: "North Indian", isAddOn: false },
    { name: "Dal Tadka", description: "Yellow lentils tempered with spices", price: 70, category: ["LUNCH", "DINNER"], mealType: "DINNER", dietType: "VEG", foodCategory: "North Indian", isAddOn: false },
    { name: "Jeera Rice", description: "Basmati rice flavored with cumin", price: 60, category: ["LUNCH", "DINNER"], mealType: "DINNER", dietType: "VEG", foodCategory: "Indian", isAddOn: true },

    // Snacks
    { name: "Samosa (2pcs)", description: "Crispy pastry filled with spiced potatoes", price: 30, category: ["EVENING_SNACKS", "MORNING_SNACKS"], mealType: "EVENING_SNACKS", dietType: "VEG", foodCategory: "Snacks", isAddOn: false },
    { name: "Veg Patties", description: "Flaky puff pastry with veg filling", price: 25, category: ["EVENING_SNACKS", "MORNING_SNACKS"], mealType: "EVENING_SNACKS", dietType: "VEG", foodCategory: "Snacks", isAddOn: false },
    { name: "Paneer Sandwich", description: "Grilled sandwich with paneer filling", price: 60, category: ["EVENING_SNACKS", "MORNING_SNACKS"], mealType: "EVENING_SNACKS", dietType: "VEG", foodCategory: "Fast Food", isAddOn: false },
    { name: "Chicken Sandwich", description: "Grilled sandwich with chicken mayo", price: 75, category: ["EVENING_SNACKS", "MORNING_SNACKS"], mealType: "EVENING_SNACKS", dietType: "NON_VEG", foodCategory: "Fast Food", isAddOn: false },
    { name: "French Fries", description: "Crispy golden potato strips", price: 50, category: ["EVENING_SNACKS"], mealType: "EVENING_SNACKS", dietType: "VEG", foodCategory: "Fast Food", isAddOn: false },
    { name: "Vada Pav", description: "Spicy potato fritter in bread bun", price: 25, category: ["EVENING_SNACKS"], mealType: "EVENING_SNACKS", dietType: "VEG", foodCategory: "Fast Food", isAddOn: false },
    { name: "Bhel Puri", description: "Savory snack with puffed rice and tangy tamarind sauce", price: 40, category: ["EVENING_SNACKS"], mealType: "EVENING_SNACKS", dietType: "VEG", foodCategory: "Snacks", isAddOn: false },
    { name: "Veg Roll", description: "Mixed veggies wrapped in paratha", price: 50, category: ["EVENING_SNACKS"], mealType: "EVENING_SNACKS", dietType: "VEG", foodCategory: "Fast Food", isAddOn: false },

    // Beverages
    { name: "Masala Chai", description: "Indian tea brewed with spices", price: 15, category: ["MORNING_SNACKS", "EVENING_SNACKS"], mealType: "EVENING_SNACKS", dietType: "BEVERAGE", foodCategory: "Beverages", isAddOn: true },
    { name: "Filter Coffee", description: "Traditional South Indian filter coffee", price: 20, category: ["BREAKFAST", "EVENING_SNACKS"], mealType: "BREAKFAST", dietType: "BEVERAGE", foodCategory: "Beverages", isAddOn: true },
    { name: "Cold Coffee", description: "Chilled sweet coffee blend", price: 60, category: ["ANY"], mealType: "ANY", dietType: "BEVERAGE", foodCategory: "Beverages", isAddOn: true },
    { name: "Fresh Lime Soda", description: "Refreshing sweet & salt lime drink", price: 40, category: ["ANY"], mealType: "ANY", dietType: "BEVERAGE", foodCategory: "Beverages", isAddOn: true },
    { name: "Sweet Lassi", description: "Traditional sweet yogurt drink", price: 45, category: ["LUNCH"], mealType: "LUNCH", dietType: "BEVERAGE", foodCategory: "Beverages", isAddOn: true },
    { name: "Mango Shake", description: "Thick milkshake with fresh mangoes", price: 70, category: ["ANY"], mealType: "ANY", dietType: "BEVERAGE", foodCategory: "Beverages", isAddOn: true }
];

async function main() {
    try {
        console.log("Seeding canteen items...");
        const school = await prisma.school.findFirst();
        if (!school) {
            console.error("No school found in the database.");
            return;
        }

        let count = 0;
        for (const item of CANTEEN_ITEMS) {
            await (prisma as any).canteenItem.create({
                data: {
                    ...item,
                    schoolId: school.id,
                    isAvailable: true
                }
            });
            count++;
        }
        console.log(`✅ Successfully seeded ${count} canteen items for school ${school.name}`);
    } catch (e) {
        console.error("Error seeding canteen items:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
