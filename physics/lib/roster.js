// Copy and paste from the google classroom
students = [
	// Period 1
	[],

	// Period 2
	[
		"Niora Abraham",
		"Brandon Adreani",
		"Arielle Ambrose",
		"Ognjen Antonijevic",
		"Katherine Babb",
		"Dakota Bartley",
		"Alden Baughman",
		"Daniel Blumkine",
		"Rhiannon Camarillo",
		"Chloe Clair",
		"Jenny Cortez",
		"Marlise Deyerl",
		"Mira Dixon",
		"Nathaniel Drebin",
		"Luke Fitzmorris",
		"Eli Hammond",
		"Haylie Huerta",
		"Matei Meglic",
		"Hana Morshedi",
		"James Murphy",
		"Reuben Noorvash",
		"Gabriel Pizarro",
		"Ava Qureshi",
		"Leo Raksin",
		"Christopher Rose",
		"Jonah Saguy",
		"Joseph Schwartz",
		"Dylan Shad",
		"Elizabeth Shepherd",
		"Ashley Spence",
		"Lila Tauzin-Fox",
		"Rolando Torres",
		"Luchia Torro",
		"Georgia Turman",
		"Cole Turner",
		"Samantha Weinberg",
		"Ryden Weiss",
		"Anique Wertheimer",
		"Alexander Wolff",
		"Leo Wou",
	],

	// Period 3
	[],

	// Period 4
	[],

	// Period 5
	[],

	// Period 6
	[],
]

function selectStudent(period) {
	let studentIdx = Math.floor(Math.random() * students.length);
	return students[period-1][studentIdx];
}
