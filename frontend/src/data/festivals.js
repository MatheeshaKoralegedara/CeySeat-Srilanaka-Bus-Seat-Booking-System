
import snowflake from '../assets/festive/snowflake.png';
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
        icons: ['🇱🇰'],
    },
    {
        name: 'christmas',
        start: '12-20',
        end: '12-30',
        icons: [ snowflake],
        isSnow: true, // special-case: real falling snow effect instead of floating icons
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

export function getActiveFestival() {
    const now = new Date();
    const monthDay = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return festivals.find((f) => monthDay >= f.start && monthDay <= f.end) || null;
}