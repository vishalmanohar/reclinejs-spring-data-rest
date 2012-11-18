this.recline = this.recline || {};
this.recline = this.recline || {};
this.recline.Backend = this.recline.Backend || {};
this.recline.Backend.SpringDataRest = this.recline.Backend.SpringDataRest || {};

(function($, my) {
    my.__type__ = 'springdatarest';

    my.springDataRestOptions = {};

    my.Wrapper = function(endpoint, options) {
        var self = this;
        this.endpoint = endpoint;
        this.options = _.extend({
                dataType: 'json'
            },
            options);


        this.mapping = function() {
            var schemaUrl = self.endpoint;
            var jqxhr = makeRequest({
                url: schemaUrl,
                dataType: this.options.dataType
            });
            return jqxhr;
        };

        // ### get
        //
        // Get record corresponding to specified id
        //
        // @return promise compatible deferred object.
        this.get = function(id) {
            var base = this.endpoint + '/' + id;
            return makeRequest({
                url: base,
                dataType: 'json'
            });
        };
    };

    my.getFields = function (data) {
        var fieldNames = _.keys(data[0]);
        fieldNames = _.filter(fieldNames, function(name ){ return name != "links"; })
        var fields = _.map(fieldNames, function(fieldName, index) {

            var field = new recline.Model.Field({
                id : fieldName,
                type:  isTimeField(fieldName) ? 'datetime' : 'string'
            });

            if(isTimeField(fieldName)){
                field.renderer = timeFormatter;
            }

            return field;
        });
        return fields;
    };

    my.fetch = function(dataset) {
        var es = new my.Wrapper(dataset.url, my.springDataRestOptions);
        var dfd = $.Deferred();
        es.mapping().done(function(result) {
            var data = result.content;

            if (!data){
                dfd.reject({'message':'REST API did not return a mapping'});
                return;
            }

            var fields = my.getFields(data);

            dfd.resolve({
                fields: fields,
                records:data,
                useMemoryStore: true   //use in memory store after fetching data
            });
        })
            .fail(function(arguments) {
                dfd.reject(arguments);
            });
        return dfd.promise();
    };

    //if fieldname ends with Time
    var isTimeField = function(fieldName) {
        return fieldName.match(/Time$/);
    }

    var makeRequest = function(data, headers) {
        var extras = {};
        if (headers) {
            extras = {
                beforeSend: function(req) {
                    _.each(headers, function(value, key) {
                        req.setRequestHeader(key, value);
                    });
                }
            };
        }
        var data = _.extend(extras, data);
        return $.ajax(data);
    };

}(jQuery, this.recline.Backend.SpringDataRest))

function timeFormatter(value, field, record){
    var date = new Date(value);
    return date;
}

