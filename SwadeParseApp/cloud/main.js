var rootURL = 'http://www.matchesfashion.com/mens';
var productRootURL = 'http://www.matchesfashion.com/product/';
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

var Product = Parse.Object.extend('Product');

Parse.Cloud.job("pageScrapeJob", function(request, status) {
	Parse.Cloud.useMasterKey();

	var query = new Parse.Query('Product');
	var prodScrapePromises = [];
	var products = [];

	query.each(function (product) {
		var newProduct = product;
		var prodURL =  productRootURL + product.get("productId");

		var prodScrapePromise = Parse.Cloud.httpRequest({
			url: prodURL
		})
		.then(
			function (httpResponse) {
				var imageURLs = extractImageURLs(httpResponse.text);
				var description = extractDescription(httpResponse.text);

				newProduct.set({
					imageURLs 	: imageURLs,
					description : description,
				});

				products.push(newProduct);
			}
		);

		prodScrapePromises.push(prodScrapePromise);
	})
	.then(function() {
		console.log(prodScrapePromises.length);
		console.log(products.length);
		return Parse.Promise.when(prodScrapePromises);
	})
	.then( function() {
		return Parse.Object.saveAll(products);
	})
	.then( 
		function() {
			status.success("Product scraping done");
		},
		function() {
			status.error("Error occured during product scraping.");
		}
	);
});

Parse.Cloud.job("scrapeJob", function(request, status) {
	Parse.Cloud.useMasterKey();

	console.log("Beginning scrape job");

	var pageScrapePromises = [];

	for (var categoryIndex in categories) {
		var category = categories[categoryIndex];
		var categoryName = category.name;

		for (var subCategoryIndex in category.subCategories) {
			subCategoryName = category.subCategories[subCategoryIndex];

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
			
			var colorPagePromises = [];

			for (var i = 0; i < colors.length; i++) {
				var color = colors[i];

				colorPagePromises.push(scrapeColorPage(categoryName, subCategoryName, color));
			}

			return Parse.Promise.when(colorPagePromises);
		}
	);

	return pageScrapePromise;
}

function scrapeColorPage(categoryName, subCategoryName, color) {
	var urlString = rootURL + '/' + categoryName + '/' + subCategoryName + '?filter=MasterColour%3A' + color;

	var colorPageScrapePromise = Parse.Cloud.httpRequest({
		url: urlString
	})
	.then(
		function (httpResponse) {
			var products = extractProducts(httpResponse.text, categoryName, subCategoryName, color);

			return Parse.Object.saveAll(products);
		}
	);

	return colorPageScrapePromise;
}

function extractImageURLs(s) {
	var imageURLs = [];

	var imageList = "image-list";
	s = s.substring(s.indexOf(imageList));

	var startIndex = s.indexOf('zoom" href="');
	while (startIndex >= 0) {
		s = s.substring(startIndex + 'zoom" href="'.length);
		var endIndex = s.indexOf('"');

		imageURLs.push(s.substring(0, endIndex));

		s = s.substring(s.indexOf("</a>"));

		startIndex = s.indexOf('zoom" href="');
	}

	return imageURLs;
}

function extractDescription(s) {
	var description = '';

	var styleStart = s.indexOf("Style notes");
	s = s.substring(styleStart);

	var startIndex = s.indexOf('<p>') + '<p>'.length;
	var endIndex = s.indexOf('</p>');

	var description = s.substring(startIndex, endIndex);

	return description;
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

function extractProducts(s, categoryName, subCategoryName, color) {
	var products = [];
	
	var productsDiv = 'class="products">';
	s = s.substring(s.indexOf(productsDiv) + productsDiv.length);

	startIndex = s.indexOf('data-wpc="');
	// find all product elements
	while (startIndex >= 0) {
		s = s.substring(startIndex + 'data-wpc="'.length);
		var endIndex = s.indexOf('"');
		var productId = parseInt(s.substring(0, endIndex));

		s = s.substring(s.indexOf('designer">') + 'designer">'.length);
		endIndex = s.indexOf('<');
		var designer = s.substring(0, endIndex);

		s = s.substring(s.indexOf('description">') + 'description">'.length);
		endIndex = s.indexOf('<');
		var description = s.substring(0, endIndex);

		var fullPrice = s.indexOf('full">');
		if (fullPrice > 0) {
			s = s.substring(fullPrice + 'full">'.length + 1);
		} else {
			s = s.substring(s.indexOf('price">') + 'price">'.length + 1);	
		}
		
		endIndex = s.indexOf('</');
		var price = s.substring(0, endIndex);
		price = Math.floor(parseInt(price.replace(/,/g, ''), 10) * 0.6);

		// advance to end of li tag
		s = s.substring(s.indexOf("slug") + 5);

		var product = new Product({
			productId	: productId,
			category 	: categoryName,
			subCategory : subCategoryName,
			colour 		: color.toLowerCase(),
			designer	: designer,
			price		: price,
			title		: description
		});
		
		products.push(product);

		console.log(productId + " " + categoryName + " " + subCategoryName + " " + 
			color.toLowerCase() + " " + price + " " + description);

		//find start of next color li
		startIndex = s.indexOf('data-wpc="');
	}

	return products;
}