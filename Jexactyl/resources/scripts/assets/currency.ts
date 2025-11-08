interface Currency {
    symbol: string;
    name: string;
}

const currencyDictionary: Record<string, Currency> = {
    AED: { symbol: 'د.إ', name: 'United Arab Emirates Dirham' },
    AUD: { symbol: 'A$', name: 'Australian Dollar' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar' },
    CHF: { symbol: 'CHF', name: 'Swiss Franc' },
    CNY: { symbol: '¥', name: 'Chinese Yuan' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'British Pound' },
    HKD: { symbol: 'HK$', name: 'Hong Kong Dollar' },
    INR: { symbol: '₹', name: 'Indian Rupee' },
    JPY: { symbol: '¥', name: 'Japanese Yen' },
    KRW: { symbol: '₩', name: 'South Korean Won' },
    MXN: { symbol: '$', name: 'Mexican Peso' },
    NOK: { symbol: 'kr', name: 'Norwegian Krone' },
    NZD: { symbol: 'NZ$', name: 'New Zealand Dollar' },
    RUB: { symbol: '₽', name: 'Russian Ruble' },
    SAR: { symbol: '﷼', name: 'Saudi Riyal' },
    SEK: { symbol: 'kr', name: 'Swedish Krona' },
    SGD: { symbol: 'S$', name: 'Singapore Dollar' },
    USD: { symbol: '$', name: 'United States Dollar' },
    ZAR: { symbol: 'R', name: 'South African Rand' },
};

export default currencyDictionary;
