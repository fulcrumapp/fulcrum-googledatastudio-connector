# Fulcrum Connector for Google Data Studio

This [Google Data Studio](https://datastudio.google.com) [Connector](https://developers.google.com/datastudio/connector/) provides users with a direct connection to the data in their [Fulcrum](https://www.fulcrumapp.com/) account. This Connector uses the [Fulcrum Query API](https://learn.fulcrumapp.com/dev/query/intro) to create a data source link to your Fulcrum Organization. Fulcrum's Query API is part of the [Fulcrum Developer Pack](http://help.fulcrumapp.com/account/organization-plan/what-is-the-developer-package), which is included with Enterprise plans and available as an add-on for other plans.

## Requirements

* Active [Fulcrum account](https://www.fulcrumapp.com/) with [Developer Pack](http://help.fulcrumapp.com/account/organization-plan/what-is-the-developer-pack) enabled
* Valid Fulcrum [API Key](https://learn.fulcrumapp.com/dev/rest/intro#authentication) (token) with access to your resources
* Google account with access to [Google Data Studio](https://datastudio.google.com/)

## Try the Fulcrum Connector in Data Studio

You can try out the managed deployment of the latest code using the following Connector ID: [AKfycbwWxwNp54DcWMzny1-9IHaBZ6YnJkezihf3XUbccCNoP5eo4-KayBS6528X5BYoFjPU](https://datastudio.google.com/datasources/create?connectorId=AKfycbwWxwNp54DcWMzny1-9IHaBZ6YnJkezihf3XUbccCNoP5eo4-KayBS6528X5BYoFjPU). Authorize the connector with your Google account and enter your Fulcrum API Key to authenticate with your Fulcrum Organization. Once configured, you are presented with an input to enter the SQL query to execute on your database. If the data connection is succesfull, you should be presented with the list of fields returned by the query. You can now create a new report or add this data source to an existing report.

## Tips, Tricks, Known Limitations

* You can only authenticate to a single Fulcrum Organization per connector. If you want to switch Organizations, you need to [revoke access](https://support.google.com/datastudio/answer/9053467?hl=en) to the connector and add it back again. Another option would be to copy this Fulcrum Connector code into your own Google account and modify or duplicate your own deployments as needed.

* Test your SQL query first using the [Fulcrum Query Utility](https://fulcrumapp.github.io/fulcrum-query-utility/) to view the available tables and make sure it's returning data before using it in the connector. The basic `SELECT * FROM tables;` query will return all of the tables available for use and is a good place to start when exploring the capabilities of the Query API.

* Fulcrum records tables only include the reference IDs for members and projects. If you want to include member/project names, you will need to join to the `memberships` and `projects` tables to the records table.

* Fulcrum media fields include the reference IDs for media files. If you want to link to these files directly without having to authenticate to your Fulcrum account, you can use the `FCM_Photo`, `FCM_Video`, `FCM_Audio`, `FCM_Signature` helper functions. Be sure to check out the other [helper functions](https://learn.fulcrumapp.com/dev/query/functions) for formatting data and timestamps and remember that the Fulcrum Query API also supports most of the standard PostgreSQL & PostGIS functions.

## Example Query

```js
SELECT r.*, m.name AS fulcrum_member, FCM_Photo(r.photos[1]) AS photo_link FROM "Inspections" r LEFT JOIN memberships m ON r._created_by_id = m.user_id ORDER BY r._created_at DESC;
```

## Additional Information

* [Google Data Studio Overview](https://datastudio.google.com/overview)

* Learn more about [How Data Studio connects to your data](https://support.google.com/datastudio/answer/6268208?hl=en)

* Learn more about [Data Studio Connectors](https://developers.google.com/datastudio/connector/)

## Disclaimer

Google Data Studio is a relatively new product, which graduated from beta status on September 20th, 2018. It is [actively being developed](https://support.google.com/datastudio/answer/6311467) and may not yet be 100% stable. While Google has several core data connectors (CSV upload, BigQuery, Google Sheets, PostgreSQL, MySQL), custom connectors _enable direct connections from Data Studio to any internet accessible data source_. Google has encouraged organizations to "leverage Data Studio as a free and powerful reporting and analysis solution for customers" and we are excited to begin testing this with our Fulcrum community.

Data Studio is free and custom connectors are free to develop so there is a low barrier to entry but please be advised that while we hope our customers are successful with Data Studio, neither it nor the Fulcrum Connector are first-class Fulcrum products so official support should not be expected.