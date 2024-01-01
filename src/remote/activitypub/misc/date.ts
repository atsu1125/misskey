const TIME2000 = 946684800000;

export function parseDate(input: unknown): Date | null {
	if (typeof input !== 'string') return null;
	const date = new Date(input);
	if (date.toString() === 'Invalid Date') return null;
	return date;
}

export function parseDateWithLimit(input: unknown, positiveMs = 1000 * 60 * 10, minValue = TIME2000): Date | null {
	const date = parseDate(input);
	if (date == null) return null;
	if (date.getTime() - Date.now() > positiveMs) return null;
	if (minValue > date.getTime()) return null;
	return date;
}
