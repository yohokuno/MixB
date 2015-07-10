// get error to be used in $ionicLoading.show(error)
function getError(url) {
  return {
    template: '読み込めませんでした：' + url,
    noBackdrop: true,
    duration: 2000
  };
}

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

// Get search attributes
function getAttributes(data) {
  var attributes = $(data).find('table > tbody > tr > td > table > tbody > tr > td > select');
  return attributes.map(function (i, e) {
    var label = $(e).find(':first-child').text().replace('で検索', '');
    $(e).find(':first-child').html('指定なし');
    return {
      id: e.name,
      label: label,
      html: e.innerHTML
    };
  });
}

// Get request for page loading
// TODO: support search and item detail request
function getRequest(url, page, timestamp) {
  var request = {
    url: url,
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ja-jp',
      'Cache-Control': 'max-age=0'
    }
  };

  if (page == 0) {
    request.method = 'GET';
  } else {
    request.method = 'POST';
    request.data = $.param({
      'page_timestamp': timestamp,
      'page_no': page + 1
    });
    request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }
  return request;
}

// Extract item detail
function getItemDetail(data, dirname) {
  var contents = $(data).find('table > tbody > tr > td > table > tbody > tr > td > table');
  // replace image path to absolute url
  contents.find('img').each(function() {
    var src = $(this).attr('src');
    $(this).attr('src', dirname + src);
  });
  var body = contents.find('tr:eq(2)');
  return {
    title : contents.find('tr:eq(0)').text(),
    metadata : contents.find('tr:eq(1)').html(),
    content : body.find('div:eq(0)').html(),
    photo : body.find('div:eq(1)').html()
  };
}