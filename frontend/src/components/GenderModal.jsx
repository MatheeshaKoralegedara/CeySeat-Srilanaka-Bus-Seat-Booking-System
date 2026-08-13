import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function GenderModal({ open, seats, onConfirm, onCancel }) {
    const { t } = useTranslation();
    const [genders, setGenders] = useState({});

    useEffect(() => {
        if (open) setGenders({});
    }, [open]);

    if (!open) return null;

    function setGender(seatNo, gender) {
        setGenders((prev) => ({ ...prev, [seatNo]: gender }));
    }

    const allSelected = seats.every((s) => genders[s]);

    return (
        <div className="fixed inset-0 bg-brand-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 scale-in">
                <h2 className="font-display text-lg font-bold text-gray-900 mb-2">
                    {seats.length > 1 ? 'Select Gender per Seat' : (t('seats.selectGenderTitle') || 'Select Gender')}
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    {t('seats.selectGenderNote') || 'Please be mindful if the next seat is booked by a passenger of the opposite gender.'}
                </p>

                <div className="space-y-3 mb-5 max-h-72 overflow-y-auto">
                    {seats.map((seatNo) => (
                        <div key={seatNo} className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-w-[3.5rem] text-center">
                                {seatNo}
                            </span>
                            <div className="grid grid-cols-2 gap-2 flex-1">
                                <button
                                    onClick={() => setGender(seatNo, 'MALE')}
                                    className={`font-semibold text-sm py-2 rounded-lg transition-colors ${
                                        genders[seatNo] === 'MALE'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                    }`}
                                >
                                    {t('seats.male') || 'Male'}
                                </button>
                                <button
                                    onClick={() => setGender(seatNo, 'FEMALE')}
                                    className={`font-semibold text-sm py-2 rounded-lg transition-colors ${
                                        genders[seatNo] === 'FEMALE'
                                            ? 'bg-pink-500 text-white'
                                            : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                                    }`}
                                >
                                    {t('seats.female') || 'Female'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => onConfirm(genders)}
                    disabled={!allSelected}
                    className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-brand-900 font-semibold py-3 rounded-xl transition-colors mb-2"
                >
                    Confirm
                </button>
                <button
                    onClick={onCancel}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition-colors"
                >
                    {t('seats.cancel') || 'Cancel'}
                </button>
            </div>
        </div>
    );
}
