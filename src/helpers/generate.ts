export function randomInteger(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 
 * @param {Number} length 
 * @param {{extension: String}} options 
 * @returns 
 */
export function randomString(length: number, options?: { extension?: string | undefined }) {
	let result = '';
	let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() *
			charactersLength));
	}
	return options?.extension !== undefined ? result + options?.extension : result;
}