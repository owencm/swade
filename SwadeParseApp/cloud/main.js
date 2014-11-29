var rootURL = 'http://www.matchesfashion.com/mens/shop/';
var queryURL = '?type=&orderby=&pagesize=240';

var categories = [
	{
		name 			: 'blazers',
		subCategories 	: [
			'casual',
			'formal'
		]
	},
	{
		name 			: 'outerwear',
		subCategories 	: [
			'bomber',
			'casual',
			'down',
			'gilet',
			'leather',
			'overcoat',
			'parka',
			'performance-jackets',
			'raincoat'
		]
	},
	{
		name 			: 'jeans',
		subCategories 	: [
			'skinny',
			'slim',
			'straight'
		]
	},
	{
		name 			: 'shirts',
		subCategories 	: [
			'casual',
			'fashion',
			'short-sleeve',
			'tie-shirts',
			'tuxedo'
		]
	},
	{
		name 			: 'shoes',
		subCategories 	: [
			'boots',
			'brogues',
			'derbies',
			'driving-shoes',
			'espadrilles',
			'lace-ups',
			'loafers',
			'monks',
			'sandals',
			'trainers'
		]
	},
	{
		name 			: 'tops',
		subCategories 	: [
			'sweatshirts',
			't-shirts-and-polos'
		]
	},
	{
		name 			: 'trousers',
		subCategories 	: [
			'casual',
			'chino',
			'evening',
			'tailored'
		]
	}
];

Parse.Cloud.job("scrapeJob", function(request, status) {
	Parse.Cloud.useMasterKey();

	console.log("Beginning scrape job");

	for (var categoryIndex in categories) {
		var category = categories[categoryIndex];
		var categoryName = category.name;
		console.log("Scraping category: " + category.name);

		for (var subCategoryIndex in category.subCategories) {
			subCategoryName = category.subCategories[subCategoryIndex];
			console.log("Scraping category: " + categoryName + " sub-category: " + subCategoryName);

		}
	}

	status.success('Scraping done.');
});