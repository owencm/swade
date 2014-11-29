var rootURL = 'http://www.matchesfashion.com/mens';
var queryURL = '?type=&orderby=&pagesize=240';

var categories = [
	{
		name 			: 'shop/blazers',
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

	var pageScrapePromises = [];

	for (var categoryIndex in categories) {
		var category = categories[categoryIndex];
		var categoryName = category.name;
		console.log("Scraping category: " + category.name);

		for (var subCategoryIndex in category.subCategories) {
			subCategoryName = category.subCategories[subCategoryIndex];
			console.log("Scraping category: " + categoryName + " sub-category: " + subCategoryName);

			pageScrapePromises.push(scrapePage(categoryName, subCategoryName));
		}
	}

	Parse.Promise.when(pageScrapePromises)
	.then(
		function() {
			status.success('Scraping done.');
		},
		function() {
			status.error('An page has occured.');
		}
	);
});

function scrapePage(categoryName, subCategoryName) {
	var urlString = rootURL + '/' + categoryName + '/' + subCategoryName + queryURL;

	var pageScrapePromise = Parse.Cloud.httpRequest({
		url: urlString
	})
	.then(
		function (httpResponse) {
			var colors = extractColors(httpResponse.text);
			console.log(categoryName + " " + subCategoryName + " " + colors);
		},
		function () {
			console.log("error occured scraping " + URL);
		}
	);

	return pageScrapePromise;
}

function extractColors(s) {
	var colors = [];
	
	var colourSpanTag = '<span>Colour</span>';
	s = s.substring(s.indexOf(colourSpanTag));
	
	var startIndex = s.indexOf('<ul class="scroll">');
	var endIndex = s.indexOf('</ul>')
	s = s.substring(startIndex, endIndex);	

	startIndex = s.indexOf(': Colour">');
	// find all li elements
	while (startIndex >= 0) {
		// add url
		colors.push(s.substring(startIndex + 10, s.indexOf("</a>")));

		// advance to end of li tag
		s = s.substring(s.indexOf("</li>") + 5);
		
		//find start of next color li
		startIndex = s.indexOf(': Colour">');
	}

	return colors;
}