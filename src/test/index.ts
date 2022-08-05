function names(namesAndAges: [string, number][]) {
    return namesAndAges.map(([name, age]) => {
        return name;
    })
}

// names([['Amir', 34], ['Betty', 17]]);
console.log(names([['Betty', 17], ['Cindy', 26], ['Dalili', 82], ['Ebony', 10]]));
