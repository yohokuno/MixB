var initialCountries = [
  {name: 'イギリス', id: 'uk'},
  {name: 'フランス', id: 'fra'},
  {name: 'ドイツ', id: 'ger'},
  {name: 'イタリア', id: 'ita'},
  {name: 'アイルランド', id: 'irl'},
  {name: 'ニューヨーク', id: 'nyc'},
  {name: 'ロサンゼルス', id: 'los'},
  {name: 'サンフランシスコ', id: 'sfc'},
  {name: 'カナダ・バンクーバー', id: 'van'},
  {name: 'オーストラリア・シドニー', id: 'syd'},
  {name: 'ニュージーランド', id: 'nz'},
  {name: 'シンガポール', id: 'sin'},
  {name: '上海', id: 'sha'},
  {name: '香港', id: 'hkg'}
];

var initialCategories = [
  {name: '住まい', id: 'acm'},
  {name: '求人', id: 'job'},
  {name: '売ります', id: 'sal'},
  {name: '買います', id: 'buy'},
  {name: 'レッスン', id: 'les'},
  {name: 'サービス', id: 'ser'},
  {name: 'サークル', id: 'cir'},
  {name: 'お知らせ', id: 'inf'}
];


// Add categories to all countries
$.each(initialCountries, function(i, country) {
  country.categories = initialCategories;
  $.each(country.categories, function(i, category) {
    category.items = [];
    category.query = '';
    category.page = 0;
    category.timestamp = 0;
    category.attributes = [];
  });
});

var loadingTemplate = {template: '<ion-spinner></ion-spinner>', noBackdrop: true};