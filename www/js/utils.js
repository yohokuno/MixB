// construct MixB's URL
function getUrl(country, category, action, id) {
  var suffix = category + '/';
  if (action) {
    suffix += category + '_' + action;
    if (!id) {
      suffix += '_f.php';
    } else if (category == 'buy') {
      suffix += '_f.php?id=' + id;
    } else {
      suffix += '_fs.php?id=' + id;
    }
  }
  // Connect to proxy
  if (document.location.hostname == 'localhost') {
    return '/uk/' + suffix;
  }
  if (country == 'uk') {
    switch (category) {
      case 'ser':
      case 'cir':
      case 'inf':
        return 'http://www.mixb.net/' + suffix;
      default:
        return 'http://www.mixb.jp/uk/' + suffix;
    }
  }
  return 'http://' + country + '.mixb.net/' + suffix;
}

// parse and extract MixB's item list
function createItems(data) {
  var contents = $(data).find('table > tbody > tr > td > table > tbody > tr > td > table');
  var rows = contents.find('tbody > tr')
    .filter(function (i, e) {
      return $(e).find('td > a').length == 1
    });
  return rows.map(function (i, e) {
    var link = $(e).find('td > a');
    var headers = $(e).find('td:not(:last)')
      .map(function (i, e2) {
        return $(e2).text().trim();
      })
      .filter(function (i, e2) {
        return e2 != '';
      })
      .get();
    return {
      title: link.text(),
      id: link.attr('href').replace(/^.*=/i, ''),
      headers: headers
    };
  }).get();
}

// get next timestamp
function getTimestamp(data) {
  return $(data)
    .find('table > tbody > tr > td > table > tbody > tr > td > table')
    .find('tbody > tr > td > input')
    .filter(function (i, e) {
      return e.name == 'page_timestamp'
    })
    .last().attr('value');
}

// Remove duplicated items
function removeDuplicates(items) {
  var seen = {};
  return items.filter(function(item) {
    if (seen.hasOwnProperty(item.id)) {
      console.log('Warning: removed duplicate: ' + JSON.stringify(item));
      return false;
    }
    seen[item.id] = true;
    return true;
  });
}
