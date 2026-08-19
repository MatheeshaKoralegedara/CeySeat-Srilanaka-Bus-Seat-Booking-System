
import snowflake from '../assets/festive/snowflake.png';
import santaHat from '../assets/festive/santa-hat.png';
import giftbox from '../assets/festive/giftbox.png';
import  fire from '../assets/festive/fire.png';
import drumer from '../assets/festive/drumer.png';
import dancer from '../assets/festive/dancer.png';
import elephant from '../assets/festive/elephant.png';


export const festivals = [
    {
        name: 'newyear',
        start: '01-01',
        end: '01-30',
        icons: ['🎉', '🎆', '✨'],
        message: '🎉 Happy New Year! Wishing you safe and happy travels in 2027.',
    },
    {
        name: 'avurudu',
        // Sinhala & Tamil New Year — mid April, adjust dates each year
        start: '04-11',
        end: '04-15',
        icons: ['🥭', '🪔', '🎉'],
        // Optional: swap emoji for real images later, see note below
    },
    {
        name: 'vesak',
        // Vesak Poya — shifts yearly, check the actual full-moon date and update
        start: '05-10',
        end: '05-14',
        icons: ['🏮', '🪷', '✨'],
    },
    {
        name: 'independence',
        start: '02-03',
        end: '02-04',
        icons: [],
        // Rendered by <IndependenceFlag> instead of the generic falling-icon overlay
        isFlag: true,
    },
    {
        name: 'christmas',
        start: '12-01',
        end: '12-30',
        icons: [snowflake, santaHat, giftbox],
        message: '🎄 Merry Christmas! Book your holiday trips early — seats fill up fast.',
    },
     {
        name: 'perahera',
        // Esala Perahera — typically late July to early August, shifts yearly (lunar calendar), adjust each year
        start: '08-18',
        end: '08-29',
        icons: [fire, drumer, dancer, elephant],
        isMarquee: true,
    },
];

function todayMonthDay() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${month}-${day}`;
}

export function getActiveFestival() {
    // Lets you preview any festival locally without touching this file,
    // e.g. http://localhost:5173/?festival=christmas
    if (typeof window !== 'undefined') {
        const override = new URLSearchParams(window.location.search).get('festival');
        if (override) {
            return festivals.find(f => f.name === override) || null;
        }
    }

    const today = todayMonthDay();
    return festivals.find(f => today >= f.start && today <= f.end) || null;
}