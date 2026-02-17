export const GOOGLE_FONTS = [
    // SCRIBBS / HANDWRITING
    { name: "Great Vibes", category: "Handwriting" },
    { name: "Dancing Script", category: "Handwriting" },
    { name: "Pacifico", category: "Handwriting" },
    { name: "Sacramento", category: "Handwriting" },
    { name: "Satisfy", category: "Handwriting" },
    { name: "Cookie", category: "Handwriting" },
    { name: "Yellowtail", category: "Handwriting" },
    { name: "Permanent Marker", category: "Handwriting" },
    { name: "Caveat", category: "Handwriting" },
    { name: "Shadows Into Light", category: "Handwriting" },

    // DISPLAY / HEADLINES
    { name: "Lobster", category: "Display" },
    { name: "Abril Fatface", category: "Display" },
    { name: "Bebas Neue", category: "Display" },
    { name: "Alpha Slab One", category: "Display" },
    { name: "Righteous", category: "Display" },
    { name: "Fredoka One", category: "Display" },
    { name: "Passion One", category: "Display" },
    { name: "Patua One", category: "Display" },
    { name: "Cinzel", category: "Display" },
    { name: "Playfair Display", category: "Display" },

    // SANS SERIF (Modern)
    { name: "Roboto", category: "Sans Serif" },
    { name: "Open Sans", category: "Sans Serif" },
    { name: "Lato", category: "Sans Serif" },
    { name: "Montserrat", category: "Sans Serif" },
    { name: "Oswald", category: "Sans Serif" },
    { name: "Raleway", category: "Sans Serif" },
    { name: "Poppins", category: "Sans Serif" },
    { name: "Nunito", category: "Sans Serif" },
    { name: "Ubuntu", category: "Sans Serif" },
    { name: "Quicksand", category: "Sans Serif" },

    // SERIF (Classic)
    { name: "Merriweather", category: "Serif" },
    { name: "Lora", category: "Serif" },
    { name: "Bitter", category: "Serif" },
    { name: "Arvo", category: "Serif" },
    { name: "Vollkorn", category: "Serif" },
    { name: "Crimson Text", category: "Serif" },
    { name: "Old Standard TT", category: "Serif" },
    { name: "Libre Baskerville", category: "Serif" },
    { name: "PT Serif", category: "Serif" },
    { name: "Domine", category: "Serif" },

    // KIDS / PLAYFUL
    { name: "Comic Neue", category: "Playful" },
    { name: "Bangers", category: "Playful" },
    { name: "Chewy", category: "Playful" },
    { name: "Luckiest Guy", category: "Playful" },
    { name: "Carter One", category: "Playful" },
];

export function getGoogleFontUrl(fonts: string[]) {
    if (!fonts.length) return "";
    // Using a more resilient format that lets Google decide weights if specific ones aren't available
    const families = fonts.map(f => f.replace(/ /g, "+") + ":ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700");
    return `https://fonts.googleapis.com/css2?family=${families.join("&family=")}&display=swap`;
}
