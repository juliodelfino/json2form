# Json2Form
Json2Form is the easiest way to convert any JSON data into an HTML form.
Simply import `json2form.js` file from this repository into your HTML headers.
Mainly written for client-side JavaScript coding.
Demo page:

---
## Requirements
 - jQuery
---
## How to use
1. Create an instance of Json2Form.
```javascript
const J2F = new Json2Form();
```
2. Invoke the `buildHtml()` function passing your JSON string or object as an argument. This will return an HTML snippet enclosed with `<div id="xxx">...</div>` block.
```javascript
let htmlForm = J2F.buildHtml(jsonStr);
//Insert htmlForm to your HTML <div> container.
```
3. If you want to save the changes you made from the HTML form, you can invoke `extractJson()` function passing the same `id` from the initial `<div id="xxx">...</div>` block.
```javascript
let newJson = J2F.extractJson(xxx);
```
4. Done!


## How to use - more options
1. Invoke the `buildHtml()` function passing your JSON string or object as an argument. This returns an HTML div block with a random `id`.
```javascript
let htmlSnippet = J2F.buildHtml(jsonStr);
//Or
let htmlSnippet = J2F.buildHtml(jsonObj);
//You can also pass a custom divId so the function returns a snippet using this id instead.
let htmlSnippet = J2F.buildHtml(jsonObj, "myDiv");
```
2. If you have a JSON schema (in either string or object form) that's compliant to `json-schema.org`, you can pass that as the 3rd argument.
```javascript
J2F.buildHtml(jsonStr, "myDiv", schema);
```
3. Json2Form can also generate the schema for you if you don't have it. This will return a JSON object that's compliant to `json-schema.org`
```javascript
J2F.generateSchema(jsonObj);
```
4. Json2Form only allows adding/removing items from an array; in this case you will see `+` and `x` buttons for adding and deleting elements respectively. For these to work, you must invoke `registerEvents()` function after adding the HTML form to your HTML `<div>` container.
```javascript
J2F.registerEvents("myDiv");
```
---
## Examples:
JSON data:
```javascript
{
  "name": "John Doe",
  "age": 19,
  "enabled": true,
  "schedule": [
    {
      "id": "sched1",
      "days": [
        "Monday",
        "Wednesday"
      ],
      "time": [
        "10:00",
        "13:00",
        "19:00"
      ]
    },
    {
      "id": "sched2",
      "days": [
        "Saturday",
        "Sunday"
      ]
    }
  ]
}
```
JSON schema:
```javascript
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "pattern": "^[A-Za-z ]+$",
      "minLength": 3,
      "maxLength": 20
    },
    "age": {
      "type": "number",
      "min": 21,
      "max": 100
    },
    "enabled": {
      "type": "boolean"
    },
    "schedule": {
      "type": "array",
      "properties": {
        "id": {
          "type": "string"
        },
        "days": {
          "type": "array",
          "itemType": "string",
          "uniqueItems": true,
          "itemEnum": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
          ]
        },
        "time": {
          "type": "array",
          "itemType": "string",
          "format": "time"
        }
      },
      "itemType": "object"
    }
  }
}
```

HTML form:

<img width="746" alt="Screenshot 2024-03-11 at 1 02 27 AM" src="https://github.com/juliodelfino/json2form/assets/7043163/bbe2e0db-8163-44f8-8f2b-940da3094766">

