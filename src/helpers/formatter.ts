function bytesToMB(x: string) {
	const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	let l = 0, n = parseInt(x, 10) || 0;
	while (n >= 1024 && ++l) {
		n = n / 1024;
	}
	return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
}

function bytesToMb(x: string) {
	const units = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'];
	let l = 0, n = parseInt(x, 10) || 0;
	while (n >= 1000 && ++l) {
		n = n / 1000;
	}
	return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
}

// Formatter number 0 to 62
function formatter(number: string, standard = "@c.us") {
	let formatted = number;
	// const standard = '@c.us'; // @s.whatsapp.net / @c.us
	if (!String(formatted).endsWith("@g.us")) {
		// isGroup ? next
		// 1. Menghilangkan karakter selain angka
		formatted = number.replace(/\D/g, "");
		// 2. Menghilangkan angka 62 di depan (prefix)
		//    Kemudian diganti dengan 0
		if (formatted.startsWith("0")) {
			formatted = "62" + formatted.slice(1);
		}
		// 3. Tambahkan standar pengiriman whatsapp
		if (!String(formatted).endsWith(standard)) {
			formatted += standard;
		}
	}
	return formatted;
}

export { bytesToMB, bytesToMb, formatter }