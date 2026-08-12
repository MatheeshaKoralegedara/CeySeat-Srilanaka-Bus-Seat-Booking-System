import { useTranslation } from 'react-i18next';

export default function GenderModal({ open, onSelect, onCancel }) {
    const { t } = useTranslation();
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">{t('seats.selectGenderTitle') || 'Select Gender'}</h2>
                <p className="text-sm text-gray-500 mb-6">
                    {t('seats.selectGenderNote') || 'Please be mindful if the next seat is booked by a passenger of the opposite gender.'}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                        onClick={() => onSelect('MALE')}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors"
                    >
                        {t('seats.male') || 'Male'}
                    </button>
                    <button
                        onClick={() => onSelect('FEMALE')}
                        className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition-colors"
                    >
                        {t('seats.female') || 'Female'}
                    </button>
                </div>

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
