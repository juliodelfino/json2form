let jsonSchema = {};
const DEFAULTS = {"array":[], "number": 0, "boolean": false, "object": {}, "string": ""};
const ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

class Json2Form {

    buildHtml(jsonStr, divId, schema) {
        let self = this;
        let id = divId ? divId : "div-" +(Math.random() + 1).toString(36).substr(2, 5);
        let json = typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
        jsonSchema[id] = schema ? schema : self.generateSchema(json);
        return "<div id='" + id + "' class='json-parent'>" + self.jsonToUiTable(jsonSchema[id], json, id) + "</div>";
    }

    extractJson(divId) {
        let self = this;
        let schema = jsonSchema[divId];
        return self.extractJsonFromUiTable($('#' + divId).find('table.' + divId), schema);
    }

    extractJsonFromUiTable(uiTable, schema) {
        let self = this;
        let obj = {};
        uiTable.find('> tbody > tr').each((idx, tr) => {
            let key = $(tr).find('.key').html().split(' ')[0];
            let value = self.extractValueFromRow($(tr), schema.properties[key]);
            obj[key] = value;
        });
        return obj;
    }

    extractValueFromInput(input, schema) {
        let type = input.attr('type');
        if (type === 'checkbox') {
            return schema.type === "array" ?
                input.filter((i, e) => $(e).prop('checked') == true).map((i,e) => e.value).get() :
                input.prop('checked') == true;
        } else {
            return (type === 'number') ? Number(input.val()) : input.val();
        }
    }

    extractValueFromRow(uiRow, schema) {
        let self = this;
        var elem = uiRow.find('> .value > input,> .value > label > input');
        if (elem.length > 0) {
            return self.extractValueFromInput(elem, schema);
        }
        elem = uiRow.find('> .value > table');
        if (elem.length > 0) {
            return self.extractJsonFromUiTable(elem, schema);
        }
        elem = uiRow.find('> .value > .list > .array-item > table');
        if (elem.length > 0) {
            return elem.map((i, e) => self.extractJsonFromUiTable($(e), schema)).get();
        }
        elem = uiRow.find('> .value > .array-item > input');
        if (elem.length > 0) {
            return elem.map((i, e) => self.extractValueFromInput($(e), schema)).get();
        }
    }

    generateSchema(obj) {
        let self = this;
        let type = typeof obj;
        if (!obj) { return {type: 'string'}; }
        let isArray = obj.constructor == Array;
        if (isArray) {
            var cSchema = obj.length == 0 ? {} : self.generateSchema(obj[0]);
            let cType = cSchema.type;
            cSchema.itemType = cType;
            cSchema.type = 'array';
            return cSchema;
        }
        else if (type === "object") {
            var cSchema = {};
            for (var x in obj) {
                cSchema[x] = self.generateSchema(obj[x]);
            }
            return {type: type, properties: cSchema};
        }
        return {type: type};
    }

    jsonToUiTable(schema, objVal, key = "", parentXPath = "") {
        let self = this;
        let xpath = parentXPath + "/" + key;
        var text = "<table class='table " + key + "'>"
        if (!objVal) objVal = {};
        Object.keys(schema.properties).forEach(function(x){
            let cSchema = schema.properties[x];
            let elemType = cSchema.type;
            let isArray = elemType === "array";
            let isUniqueAllowedValArray = cSchema.uniqueItems && cSchema.itemEnum;
            let rowText = (isArray ? self.jsonToUiList(cSchema, objVal[x], x, xpath) :
                elemType === 'object'?
                self.jsonToUiTable(cSchema, objVal[x], x, xpath) : self.valToUi(cSchema, objVal[x]));
            let cXPath = xpath + "/" + x;
            let addBtn = isArray && !isUniqueAllowedValArray ? " <button class='btn-add-json-ui' data-xpath='" + cXPath + "'>+</button>" : "";
            text += "<tr><td class='key'>" + x + addBtn + "</td><td class='value " + x + "-value'>" + rowText + "</td></tr>";
        });
        text += "</table>"
        return text;
    }

    jsonToUiList(schema, listVal, key = "", parentXPath = key) {
        let self = this;
        let xpath = parentXPath + "/" + key;
        let isElemPrimitive = schema.itemType != "object";
        var text = "<div class='list " + key + "'>";
        if (!listVal) listVal = [];
        if (isElemPrimitive) {
            if (schema.uniqueItems && schema.itemEnum) {
                return schema.itemEnum.map(e => self.valToUi({type: 'boolean'}, listVal.includes(e), e)).join(" ");
            } else {
                return listVal
                    .map(j => self.asArrayItem(self.valToUi(schema, j), schema.itemType))
                    .join("");
            }
        }
        else {
            for (var x in listVal) {
                var rowText = self.jsonToUiTable(schema, listVal[x], key, parentXPath);
                text += self.asArrayItem(rowText, schema.itemType, x);
            }
        }
        text += "</div>"
        return text;
    }

    valToUi(schema, val = "", label = "") {
        let self = this;
        let valType = schema.itemType ? schema.itemType : schema.type;
        let addProps = Object.keys(schema).filter(t => !["type", "itemType"].includes(t))
            .map(t => t + "='" + schema[t] + "'").join(" ");
        if (valType === "boolean") {
            return "<label><input type='checkbox' " + (val ? "checked" : "") + " value='" + label + "'> " + label + "</label>";
        }
        let type = valType === "number" ? "number" : (schema.format ? schema.format : "text");
        if (!val) val = DEFAULTS[valType];
        return "<input type='" + type + "' value='" + self.escapeHtml(val) + "' " + addProps + " oninput='this.reportValidity()' title='" + self.escapeHtml(addProps)  + "' />";
    }

    asArrayItem(htmlUi, valType, key) {
        let deleteBtn = "<button class='btn-del-json-ui'>x</button>";
        if (valType === "object") {
            return "<div class='array-item' style='border: solid 0.5px; white-space: nowrap'>" + htmlUi + deleteBtn + "</div>";
        } else {
            return "<div class='array-item' style='display: inline; margin-right: 10px; white-space: nowrap'>" + htmlUi + deleteBtn + "</div>";
        }
    }

    escapeHtml (string) {
      return String(string).replace(/[&<>"'`=\/]/g, function (s) {
        return ENTITY_MAP[s];
      });
    }

    registerEvents(divId) {
        let self = this;
        let onDeleteBtnClicked = function(e){
            var parentDiv = $(this).parent();
            if (!parentDiv.attr("class") || !parentDiv.attr("class").includes("array-item")) {
             parentDiv = parentDiv.parent();
            }
            parentDiv.remove();
        };
        let onAddBtnClicked = function(){
            let xpath = $(this).attr('data-xpath');
            let xpTokens = xpath.split('/').filter(i => i != '');
            var schema = jsonSchema;
            for (var i in xpTokens) {
              schema = i == 0 ? schema[xpTokens[i]] : schema.properties[xpTokens[i]];
            }
            let key = xpTokens[xpTokens.length-1];
            let className = "." + key + "-value";
            var valueDiv = $(this).parent().parent().find(className);
            if (schema.itemType === "object") {
                valueDiv = valueDiv.find(".list." + key);
                valueDiv.append(self.asArrayItem(self.jsonToUiTable(schema, {}, key, xpath.substring(0, xpath.lastIndexOf('/'))), schema.itemType));
            } else {
                valueDiv.append(self.asArrayItem(self.valToUi(schema), schema.itemType));
            }
            valueDiv.children().last().find(".btn-add-json-ui").click(onAddBtnClicked);
            valueDiv.children().last().find(".btn-del-json-ui").click(onDeleteBtnClicked);
        };
        $(divId).find(".btn-add-json-ui").click(onAddBtnClicked);
        $(divId).find(".btn-del-json-ui").click(onDeleteBtnClicked);
    }
}
