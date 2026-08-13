
import snowflake from '../assets/festive/snowflake.png';


export const festivals = [
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
        end: '12-26',
        icons: [ snowflake],
        isSnow: true, // special-case: real falling snow effect instead of floating icons
    },
];

export function getActiveFestival() {
    const now = new Date();
    const monthDay = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return festivals.find((f) => monthDay >= f.start && monthDay <= f.end) || null;
}