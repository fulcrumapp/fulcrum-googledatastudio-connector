function getToken() {
  var userProperties = PropertiesService.getUserProperties();
  return userProperties.getProperty('dscc.key');
}

function executeQuery(sql, token) {
  var url = 'https://api.fulcrumapp.com/api/v2/query';

  if (token == null) {
    token = getToken();
  }

  var params = {
    method: 'POST',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: {
      'X-ApiToken': token,
      'User-Agent': 'Fulcrum Google Data Studio Connector'
    },
    payload: JSON.stringify({
      'q': sql,
      'format': 'json',
      'metadata': '0',
      'arrays': '1'
    })
  };

  var response = UrlFetchApp.fetch(url, params);
  var responseCode = response.getResponseCode();
  var responseText = response.getContentText();

  if (responseCode === 200) {
    return JSON.parse(responseText);
  } else {
    throw new Error('DS_USER:' + JSON.parse(responseText).error);
  }
}

function getAuthType() {
  return {
    type: 'KEY'
  };
}

function setCredentials(request) {
  var token = request.key;

  var valid = validateToken(token);

  if (!valid) {
    return {
      errorCode: 'INVALID_CREDENTIALS'
    };
  }

  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('dscc.key', token);

  return {
    errorCode: 'NONE'
  };
}

function validateToken(token) {
  var valid = false;

  try {
    executeQuery('SELECT 1', token);
    valid = true;
  } catch (ex) {};

  return valid;
}

function isAuthValid() {
  return validateToken(getToken());
}

function resetAuth() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('dscc.key');
}

function getConfig() {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config.newInfo()
    .setId('instructions')
    .setText('Enter the SQL query to execute. Fulcrum Query API documentation is available at https://developer.fulcrumapp.com/query-api/intro/.');

  config
    .newTextArea()
    .setId('query')
    .setName('Fulcrum SQL SELECT Statement')
    .setHelpText('e.g. SELECT * FROM "inspections"')
    .setPlaceholder('SELECT * FROM "inspections"');

  return config.build();
}

function getFields(request) {
  var data = executeQuery(request.configParams.query);
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  var TYPES = {
    integer: types.NUMBER,
    double: types.NUMBER,
    boolean: types.BOOLEAN,
    geometry: types.LATITUDE_LONGITUDE,
    timestamp: types.YEAR_MONTH_DAY,
    string: types.TEXT
  };

  for (var i = 0; i < data.fields.length; i++) {
    if (data.fields[i].type == 'integer' || data.fields[i].type == 'double') {
      fields.newMetric()
        .setId(data.fields[i].name)
        .setName(data.fields[i].name)
        .setDescription(data.fields[i].name)
        .setType(types.NUMBER)
    } else {
      fields.newDimension()
        .setId(data.fields[i].name)
        .setName(data.fields[i].name)
        .setDescription(data.fields[i].name)
        .setType(TYPES[data.fields[i].type] || types.TEXT);
    }
  }

  return fields;
}

function getSchema(request) {
  var fields = getFields(request).build();
  return {
    'schema': fields
  };
}

function getData(request) {
  var data = executeQuery(request.configParams.query);

  var requestedIndexes = [];

  for (var i = 0; i < request.fields.length; ++i) {
    var field = request.fields[i];

    for (var j = 0; j < data.fields.length; ++j) {
      if (data.fields[j].name === field.name) {
        requestedIndexes.push(j);
      }
    }
  }

  var filteredSchema = getSchema(request).schema.filter(function (field, index) {
    return requestedIndexes.indexOf(index) !== -1;
  });

  var rows = data.rows.map(function (row) {
    return {
      values: row.map(function (value, index) {
        if (data.fields[index].type === 'geometry') {
          return value != null ? value.coordinates.reverse().join(', ') : null
        } else if (data.fields[index].type === 'timestamp') {
          return value != null ? [value.substring(0, 4), value.substring(5, 7), value.substring(8, 10)].join('') : null
        }

        return value != null ? value.toString() : null;
      }).filter(function (value, index) {
        return requestedIndexes.indexOf(index) !== -1;
      })
    };
  });

  var result = {
    schema: filteredSchema,
    rows: rows
  };

  return result;
}

function isAdminUser() {
  return false;
}