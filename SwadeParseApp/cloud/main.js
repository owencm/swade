Parse.Cloud.job("cloneJob", function(request, status) {
	
}var rootURL = 'http://www.matchesfashion.com/mens/shop/';
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
