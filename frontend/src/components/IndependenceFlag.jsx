import { getActiveFestival } from '../data/festivals';
import flagImage from '../assets/festive/Flag-Sri-Lanka.webp';

const STRIP_COUNT = 33;
const FLAG_WIDTH = 66;
const FLAG_HEIGHT = 40;
const STRIP_WIDTH = FLAG_WIDTH / STRIP_COUNT;

export default function IndependenceFlag() {
    const festival = getActiveFestival();
    if (!festival || festival.name !== 'independence') return null;

    return (
        <div className="flex items-center">
            <div className="flag-wave-container" style={{ width: FLAG_WIDTH, height: FLAG_HEIGHT }}>
                {Array.from({ length: STRIP_COUNT }, (_, i) => (
                    <div
                        key={i}
                        className="flag-wave-strip"
                        style={{
                            width: STRIP_WIDTH,
                            backgroundImage: `url(${flagImage})`,
                            backgroundSize: `${FLAG_WIDTH}px ${FLAG_HEIGHT}px`,
                            backgroundPositionX: -(i * STRIP_WIDTH),
                            animationDelay: `${i * 0.09}s`,
                            
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
